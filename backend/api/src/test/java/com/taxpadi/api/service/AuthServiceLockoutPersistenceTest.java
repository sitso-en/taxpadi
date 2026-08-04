package com.taxpadi.api.service;

import com.taxpadi.api.dto.auth.LoginRequest;
import com.taxpadi.api.model.TaxpayerCategory;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.UserRepository;
import com.taxpadi.api.util.PhoneUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Companion to {@link AuthServiceLockoutTest}, which builds AuthService with {@code new}
 * and therefore runs without the Spring proxy that implements {@code @Transactional}.
 * That unit test can show the counter is incremented in memory and that save() is called,
 * but not whether the write survives the exception thrown to reject the login — a rollback
 * discarding it is invisible from there.
 *
 * <p>These tests go through the real proxy and a real database, and re-read the row
 * afterwards. That re-read is the whole point: it is the only thing that distinguishes
 * "counted" from "counted and then silently rolled back".
 */
@SpringBootTest
class AuthServiceLockoutPersistenceTest {

    private static final String CORRECT_PASSWORD = "correct-password-123";
    private static final String IP = "203.0.113.7";

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private UUID userId;
    private String phone;

    @BeforeEach
    void createTestUser() {
        // A fresh random MSISDN each run, so the test never collides with — or deletes —
        // a real account if it is ever pointed at a populated database.
        phone = PhoneUtil.normalize(
                "024" + ThreadLocalRandom.current().nextInt(1_000_000, 10_000_000));

        User user = new User();
        user.setFullName("Lockout Persistence Test");
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(CORRECT_PASSWORD));
        user.setTaxpayerCategory(TaxpayerCategory.INDIVIDUAL);
        user.setRegion("Greater Accra");
        user.setVerified(true);
        user.setActive(true);

        userRepository.save(user);
        userId = user.getUserId();
    }

    @AfterEach
    void removeTestUser() {
        // Only ever the row this test created. audit_logs cascades on delete.
        userRepository.findById(userId).ifPresent(userRepository::delete);
    }

    @Test
    void failedAttemptIsStillCountedAfterTheLoginIsRejected() {
        attemptLogin("wrong-password");

        // Fails if the rejection rolls back the counter — the original bug.
        assertThat(reload().getFailedLoginAttempts()).isEqualTo(1);
    }

    @Test
    void attemptsAccumulateAcrossSeparateCalls() {
        attemptLogin("wrong-password");
        attemptLogin("wrong-password");
        attemptLogin("wrong-password");

        assertThat(reload().getFailedLoginAttempts()).isEqualTo(3);
    }

    @Test
    void fifthFailedAttemptActuallyLocksTheAccount() {
        for (int i = 0; i < 5; i++) {
            attemptLogin("wrong-password");
        }

        User locked = reload();
        assertThat(locked.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(locked.getLockedUntil()).isNotNull();
        assertThat(locked.getLockedUntil()).isAfter(LocalDateTime.now());

        // The behaviour that actually matters: once locked, even the correct
        // password is refused. Without a persisted lock this call would succeed.
        assertThatThrownBy(() -> authService.login(request(CORRECT_PASSWORD), IP))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("locked");
    }

    @Test
    void successfulLoginClearsAccumulatedAttempts() {
        attemptLogin("wrong-password");
        attemptLogin("wrong-password");
        assertThat(reload().getFailedLoginAttempts()).isEqualTo(2);

        authService.login(request(CORRECT_PASSWORD), IP);

        User cleared = reload();
        assertThat(cleared.getFailedLoginAttempts()).isZero();
        assertThat(cleared.getLockedUntil()).isNull();
    }

    /** Drives a login expected to be refused; the rejection itself is not what we assert on. */
    private void attemptLogin(String password) {
        try {
            authService.login(request(password), IP);
        } catch (RuntimeException expected) {
            // Rejection is the precondition for the assertions above, not the subject.
        }
    }

    private User reload() {
        return userRepository.findById(userId).orElseThrow();
    }

    private LoginRequest request(String password) {
        LoginRequest r = new LoginRequest();
        r.setPhone(phone);
        r.setPassword(password);
        r.setDeviceInfo("lockout-persistence-test");
        return r;
    }
}
