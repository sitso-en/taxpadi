package com.taxpadi.api.service;

import com.taxpadi.api.dto.auth.LoginRequest;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Guards the login lockout messaging: failed attempts count down ("N left") and
 * the attempt that reaches MAX_LOGIN_ATTEMPTS (5) reports the lock instead of a
 * plain "wrong password".
 */
class AuthServiceLockoutTest {

    private UserRepository userRepository;
    private BCryptPasswordEncoder passwordEncoder;
    private AuditLogService auditLogService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(BCryptPasswordEncoder.class);
        auditLogService = mock(AuditLogService.class);
        // Only the failed-password path is exercised, so the remaining collaborators
        // are never touched and can be null.
        authService = new AuthService(
            userRepository, null, null, null, null, null, null,
            passwordEncoder, null, null, auditLogService, null, null);
    }

    // ── Wrong password below the limit → countdown message ──

    @Test
    void login_wrongPassword_countsDownRemainingAttempts() {
        User user = verifiedUser();
        user.setFailedLoginAttempts(1); // this attempt is the 2nd → 3 of 5 left
        when(userRepository.findByPhone(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request("wrong"), "1.1.1.1"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("3 attempt(s) left");

        assertThat(user.getFailedLoginAttempts()).isEqualTo(2);
        assertThat(user.getLockedUntil()).isNull();
        verify(userRepository).save(user);
    }

    // ── The attempt that reaches the limit → locked, not "wrong password" ──

    @Test
    void login_finalAttempt_locksAccountAndSaysSo() {
        User user = verifiedUser();
        user.setFailedLoginAttempts(4); // this attempt is the 5th → lock
        when(userRepository.findByPhone(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request("wrong"), "1.1.1.1"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("locked");

        assertThat(user.getLockedUntil()).isNotNull();
        verify(userRepository).save(user);
    }

    // ── An already-locked account is rejected up-front, no extra attempts spent ──

    @Test
    void login_alreadyLocked_isRejectedWithoutCountingAgain() {
        User user = verifiedUser();
        user.setFailedLoginAttempts(5);
        user.setLockedUntil(java.time.LocalDateTime.now().plusMinutes(30));
        when(userRepository.findByPhone(anyString())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request("whatever"), "1.1.1.1"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("locked");

        assertThat(user.getFailedLoginAttempts()).isEqualTo(5); // unchanged
        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).matches(any(), any());
    }

    // ── helpers ──

    private User verifiedUser() {
        User u = new User();
        u.setActive(true);
        u.setVerified(true);
        u.setPasswordHash("hash");
        return u;
    }

    private LoginRequest request(String password) {
        LoginRequest r = new LoginRequest();
        r.setPhone("0241234567");
        r.setPassword(password);
        return r;
    }
}
