package com.taxpadi.api.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxpadi.api.dto.user.ChangePasswordRequest;
import com.taxpadi.api.dto.user.DataRequestResponse;
import com.taxpadi.api.dto.user.DeactivateAccountRequest;
import com.taxpadi.api.dto.user.HealthScoreResponse;
import com.taxpadi.api.dto.user.RevokeSessionResponse;
import com.taxpadi.api.dto.user.SessionDto;
import com.taxpadi.api.dto.user.SessionsResponse;
import com.taxpadi.api.dto.user.UpdateProfileRequest;
import com.taxpadi.api.dto.user.UpdateProfileResponse;
import com.taxpadi.api.dto.user.UserProfileResponse;
import com.taxpadi.api.dto.user.PermanentDeleteRequest;
import com.taxpadi.api.dto.user.RevokeAllSessionsResponse;
import com.taxpadi.api.exception.ConflictException;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.RefreshToken;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.RefreshTokenRepository;
import com.taxpadi.api.repository.UserRepository;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final DataExportService dataExportService;

    public UserService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       AuditLogService auditLogService,
                       DataExportService dataExportService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.dataExportService = dataExportService;
    }

    public UserProfileResponse getProfile(User user) {
        return new UserProfileResponse(
            user.getUserId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getTin(),
            user.getRegion(),
            user.getTaxpayerCategory(),
            user.getSubscriptionTier(),
            user.getRole(),
            user.isActive(),
            user.isVerified(),
            user.getCreatedAt()
        );
    }

    @Transactional
    public UpdateProfileResponse updateProfile(User user, UpdateProfileRequest request, String ipAddress) {
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getRegion() != null) user.setRegion(request.getRegion());

        if (request.getEmail() != null) {
            userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
                if (!existing.getUserId().equals(user.getUserId())) {
                    throw new ConflictException("An account with this email already exists");
                }
            });
            user.setEmail(request.getEmail());
        }

        if (request.getTin() != null) {
            if (!request.getTin().matches("[A-Za-z]\\d{10}")) {
                throw new IllegalArgumentException("TIN must be a letter followed by 10 digits (e.g. P0012345678)");
            }
            user.setTin(request.getTin());
        }

        if (request.getTaxpayerCategory() != null) {
            user.setTaxpayerCategory(request.getTaxpayerCategory());
        }

        userRepository.save(user);
        auditLogService.log(user, "PROFILE_UPDATED", "Profile fields updated", ipAddress);
        log.info("Profile updated for userId={}", user.getUserId());
        String categoryName = user.getTaxpayerCategory() != null ? user.getTaxpayerCategory().name() : null;
        return new UpdateProfileResponse(
            user.getUserId(), user.getFullName(), user.getEmail(),
            user.getTin(), user.getRegion(), categoryName, user.getUpdatedAt()
        );
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request, UUID currentTokenId, String ipAddress) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalStateException("New password and confirm password do not match");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUserExcept(user, currentTokenId);
        auditLogService.log(user, "PASSWORD_CHANGED", "Password changed, all other sessions revoked", ipAddress);
        log.info("Password changed for userId={}, other sessions revoked", user.getUserId());
    }

    @Transactional
    public void deactivateAccount(User user, DeactivateAccountRequest request, String ipAddress) {
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Password is incorrect");
        }
        user.setActive(false);
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUser(user);
        auditLogService.log(user, "ACCOUNT_DEACTIVATED", "Account deactivated by user", ipAddress);
        log.info("Account deactivated for userId={}", user.getUserId());
    }

    public HealthScoreResponse getHealthScore(User user) {
        throw new NotFoundException("Not enough activity to calculate a score yet");
    }

    public DataRequestResponse requestData(User user) {
        log.info("Data export requested for userId={}", user.getUserId());
        dataExportService.exportAndSend(user);
        return new DataRequestResponse(UUID.randomUUID(), "sent", 0);
    }

    public SessionsResponse getSessions(User user, UUID currentTokenId) {
        List<RefreshToken> tokens = refreshTokenRepository
            .findByUserAndRevokedFalseAndExpiresAtAfter(user, LocalDateTime.now());

        List<SessionDto> sessions = tokens.stream()
            .map(t -> new SessionDto(
                t.getTokenId(),
                t.getDeviceInfo(),
                t.getIpAddress(),
                t.getCreatedAt(),
                t.getLastUsedAt(),
                t.getExpiresAt(),
                t.getTokenId().equals(currentTokenId)
            ))
            .collect(Collectors.toList());

        return new SessionsResponse(sessions);
    }

    @Transactional
    public RevokeSessionResponse revokeSession(User user, UUID tokenId, UUID currentTokenId) {
        if (tokenId.equals(currentTokenId)) {
            throw new ForbiddenException("Use the logout endpoint to end your current session");
        }

        RefreshToken token = refreshTokenRepository.findByTokenIdAndUser(tokenId, user)
            .orElseThrow(() -> new NotFoundException("Session not found"));

        token.setRevoked(true);
        token.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);

        log.info("Session {} revoked for userId={}", tokenId, user.getUserId());
        return new RevokeSessionResponse(token.getTokenId(), token.getDeviceInfo(), token.getRevokedAt());
    }

    @Transactional
    public RevokeAllSessionsResponse revokeAllSessions(User user, UUID currentTokenId) {
        int count = refreshTokenRepository.revokeAllByUserExcept(user, currentTokenId);
        log.info("Revoked {} sessions for userId={}", count, user.getUserId());
        return new RevokeAllSessionsResponse(count);
    }

    @Transactional
    public void permanentDelete(User user, PermanentDeleteRequest request) {
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Password is incorrect");
        }
        if (!"DELETE MY ACCOUNT PERMANENTLY".equals(request.getConfirmation())) {
            throw new IllegalStateException("Please type DELETE MY ACCOUNT PERMANENTLY to confirm");
        }
        // Retention period check will be enforced when tax_returns is implemented (Group 14)
        userRepository.delete(user);
        log.info("Permanent deletion completed for userId={}", user.getUserId());
    }
}
