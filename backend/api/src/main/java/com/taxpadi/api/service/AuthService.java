package com.taxpadi.api.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxpadi.api.dto.auth.BiometricLoginRequest;
import com.taxpadi.api.dto.auth.BiometricLoginResponse;
import com.taxpadi.api.dto.auth.LoginRequest;
import com.taxpadi.api.dto.auth.LoginResponse;
import com.taxpadi.api.dto.auth.LogoutResponse;
import com.taxpadi.api.dto.auth.RefreshTokenRequest;
import com.taxpadi.api.dto.auth.RefreshTokenResponse;
import com.taxpadi.api.dto.auth.RegisterBiometricRequest;
import com.taxpadi.api.dto.auth.RegisterBiometricResponse;
import com.taxpadi.api.dto.auth.RegisterRequest;
import com.taxpadi.api.dto.auth.RegisterResponse;
import com.taxpadi.api.dto.auth.ResendOtpRequest;
import com.taxpadi.api.dto.auth.ResendOtpResponse;
import com.taxpadi.api.dto.auth.UserSummary;
import com.taxpadi.api.dto.auth.VerifyOtpRequest;
import com.taxpadi.api.dto.auth.VerifyOtpResponse;
import com.taxpadi.api.dto.auth.VerifyResetOtpResponse;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ConflictException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.exception.TooManyRequestsException;
import com.taxpadi.api.util.PhoneUtil;
import com.taxpadi.api.model.DeviceToken;
import com.taxpadi.api.model.OtpPurpose;
import com.taxpadi.api.model.OtpVerification;
import com.taxpadi.api.model.RefreshToken;
import com.taxpadi.api.model.SubscriptionTier;
import com.taxpadi.api.model.TaxProfile;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.UserTaxProfile;
import com.taxpadi.api.repository.DeviceTokenRepository;
import com.taxpadi.api.repository.OtpVerificationRepository;
import com.taxpadi.api.repository.RefreshTokenRepository;
import com.taxpadi.api.constant.SubscriptionStatus;
import com.taxpadi.api.repository.SubscriptionRepository;
import com.taxpadi.api.repository.TaxProfileRepository;
import com.taxpadi.api.repository.UserRepository;
import com.taxpadi.api.repository.UserTaxProfileRepository;

import io.jsonwebtoken.Claims;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int MAX_OTP_ATTEMPTS   = 5;
    private static final int LOCK_MINUTES       = 30;
    private static final int OTP_RESEND_COOLDOWN_SECONDS = 60;

    private final UserTaxProfileRepository userTaxProfileRepository;
    private final TaxProfileRepository taxProfileRepository;
    private final UserRepository userRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final SmsService smsService;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;
    private final EmailService emailService;
    private final StringRedisTemplate redis;

    public AuthService(UserRepository userRepository, OtpVerificationRepository otpVerificationRepository,
        UserTaxProfileRepository userTaxProfileRepository, TaxProfileRepository taxProfileRepository,
        RefreshTokenRepository refreshTokenRepository,
        DeviceTokenRepository deviceTokenRepository,
        SubscriptionRepository subscriptionRepository,
        BCryptPasswordEncoder bCryptPasswordEncoder, SmsService smsService, JwtService jwtService,
        AuditLogService auditLogService, EmailService emailService,
        StringRedisTemplate redis
    ){
        this.userRepository = userRepository;
        this.userTaxProfileRepository = userTaxProfileRepository;
        this.taxProfileRepository = taxProfileRepository;
        this.otpVerificationRepository = otpVerificationRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.passwordEncoder = bCryptPasswordEncoder;
        this.smsService = smsService;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
        this.redis = redis;
    }


    @Transactional
    public RegisterResponse register(RegisterRequest request){
        String phone = PhoneUtil.normalize(request.getPhone());
        String email = request.getEmail();
        log.info("Registration attempt for phone={}", phone);

        // If phone already exists but account is unverified, resume registration
        // by updating details and resending a fresh OTP — don't block the user.
        var existingByPhone = userRepository.findByPhone(phone);
        if (existingByPhone.isPresent()) {
            User existing = existingByPhone.get();
            if (existing.isVerified()) {
                log.warn("Registration failed — phone already taken: {}", phone);
                throw new ConflictException("Phone number is already taken");
            }
            // Unverified account — update their details in case they changed anything
            // and resend a fresh OTP so they can continue.
            String cooldownKey = "otp:resend:" + existing.getUserId() + ":" + OtpPurpose.REGISTER.name();
            if (Boolean.TRUE.equals(redis.hasKey(cooldownKey))) {
                log.warn("Resume registration rate-limited for userId={}", existing.getUserId());
                throw new TooManyRequestsException("Please wait " + OTP_RESEND_COOLDOWN_SECONDS + " seconds before requesting another OTP");
            }
            redis.opsForValue().set(cooldownKey, "1", Duration.ofSeconds(OTP_RESEND_COOLDOWN_SECONDS));

            existing.setFullName(request.getFullName());
            existing.setEmail(request.getEmail());
            existing.setRegion(request.getRegion());
            existing.setTaxpayerCategory(request.getTaxpayerCategory());
            existing.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            userRepository.save(existing);
            otpVerificationRepository.invalidateActiveOtps(existing, OtpPurpose.REGISTER);
            String otpCode = String.valueOf(100000 + secureRandom.nextInt(900000));
            OtpVerification otp = new OtpVerification();
            otp.setUser(existing);
            otp.setOtpCode(otpCode);
            otp.setPurpose(OtpPurpose.REGISTER);
            otp.setExpiresAt(LocalDateTime.now().plusMinutes(10));
            otpVerificationRepository.save(otp);
            smsService.sendOtp(phone, otpCode);
            log.info("Resumed registration for userId={}, fresh OTP sent", existing.getUserId());
            return new RegisterResponse(existing.getUserId(), existing.getPhone(), "OTP sent to your phone number");
        }

        if (email != null) {
            var existingByEmail = userRepository.findByEmail(email);
            if (existingByEmail.isPresent() && existingByEmail.get().isVerified()) {
                log.warn("Registration failed — email already taken: {}", email);
                throw new ConflictException("Email is already taken");
            }
            // If email belongs to an unverified account it will be overwritten below — that's fine.
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setFullName(request.getFullName());
        user.setPhone(phone);
        user.setEmail(email);
        user.setRegion(request.getRegion());
        user.setTaxpayerCategory(request.getTaxpayerCategory());
        user.setPasswordHash(hashedPassword);

        userRepository.save(user);
        log.info("User saved: userId={}, phone={}", user.getUserId(), phone);

        TaxProfile primaryProfile = new TaxProfile();
        primaryProfile.setUser(user);
        primaryProfile.setLabel("Personal");
        primaryProfile.setTaxpayerCategory(user.getTaxpayerCategory());
        primaryProfile.setIsPrimary(true);
        taxProfileRepository.save(primaryProfile);
        user.setActiveProfileId(primaryProfile.getProfileId());
        userRepository.save(user);
        log.debug("Primary tax profile created for userId={}", user.getUserId());

        UserTaxProfile profile = new UserTaxProfile();
        profile.setUser(user);
        userTaxProfileRepository.save(profile);
        log.debug("Tax profile created for userId={}", user.getUserId());

        String otpCode = String.valueOf(100000 + secureRandom.nextInt(900000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        OtpVerification otp = new OtpVerification();
        otp.setUser(user);
        otp.setOtpCode(otpCode);
        otp.setPurpose(OtpPurpose.REGISTER);
        otp.setExpiresAt(expiresAt);
        otpVerificationRepository.save(otp);
        log.debug("OTP saved for userId={}, expiresAt={}", user.getUserId(), expiresAt);

        smsService.sendOtp(phone, otpCode);
        log.info("Registration complete for userId={}, OTP dispatched to phone={}", user.getUserId(), phone);

        return new RegisterResponse(user.getUserId(),
                user.getPhone(),
                "OTP sent to your phone number"
        );
    }

    @Transactional
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request, String ipAddress) {
        String phone = PhoneUtil.normalize(request.getPhone());
        OtpPurpose purpose = request.getPurpose();
        log.info("OTP verification attempt for phone={}, purpose={}", phone, purpose);

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new NotFoundException("No account found for this phone number"));

        OtpVerification otp = otpVerificationRepository
                .findFirstByPurposeAndUserAndUsedOrderByCreatedAtDesc(purpose, user, false)
                .orElseThrow(() -> new BadRequestException("No active OTP found. Please request a new one"));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("OTP expired for userId={}", user.getUserId());
            throw new IllegalStateException("OTP has expired. Please request a new one");
        }

        if (!otp.getOtpCode().equals(request.getOtpCode())) {
            int attempts = otp.getAttemptCount() + 1;
            otp.setAttemptCount(attempts);
            if (attempts >= MAX_OTP_ATTEMPTS) {
                otp.setUsed(true); // burn the OTP — user must request a new one
                otpVerificationRepository.save(otp);
                log.warn("OTP burned after {} failed attempts for userId={}", attempts, user.getUserId());
                throw new IllegalArgumentException("Too many incorrect attempts. Please request a new OTP");
            }
            otpVerificationRepository.save(otp);
            log.warn("Invalid OTP code submitted for userId={}, attempt {}/{}", user.getUserId(), attempts, MAX_OTP_ATTEMPTS);
            throw new IllegalArgumentException("Invalid OTP code. " + (MAX_OTP_ATTEMPTS - attempts) + " attempt(s) remaining");
        }

        otp.setUsed(true);
        otpVerificationRepository.save(otp);

        if (purpose == OtpPurpose.REGISTER) {
            user.setVerified(true);
            userRepository.save(user);
            if (user.getEmail() != null) {
                emailService.sendWelcome(user.getEmail(), user.getFullName());
            }
            log.info("Account verified for userId={}", user.getUserId());

            // Auto-login: create a session so the frontend can skip the login screen
            String deviceInfo = request.getDeviceInfo() != null ? request.getDeviceInfo() : "mobile";
            String rawRefreshToken = UUID.randomUUID().toString();
            refreshTokenRepository.revokeByUserAndDevice(user.getUserId(), deviceInfo, LocalDateTime.now());
            RefreshToken refreshToken = new RefreshToken();
            refreshToken.setUser(user);
            refreshToken.setTokenHash(hashToken(rawRefreshToken));
            refreshToken.setDeviceInfo(deviceInfo);
            refreshToken.setIpAddress(ipAddress);
            refreshToken.setExpiresAt(LocalDateTime.now().plusDays(30));
            refreshTokenRepository.save(refreshToken);

            String accessToken = jwtService.generateAccessToken(user, refreshToken.getTokenId());

            boolean isPaid = subscriptionRepository.existsByUserAndStatus(user, SubscriptionStatus.ACTIVE);
            boolean onboardingComplete = userTaxProfileRepository.findByUser(user)
                    .map(p -> Boolean.TRUE.equals(p.getOnboardingComplete())
                            || (user.getTin() != null && !user.getTin().isBlank() && p.getTaxYearStart() != null))
                    .orElse(false);
            UserSummary userSummary = new UserSummary(
                    user.getUserId(), user.getFullName(), user.getPhone(),
                    isPaid ? SubscriptionTier.PAID.name() : SubscriptionTier.FREE.name(),
                    onboardingComplete);

            auditLogService.log(user, "LOGIN", "Auto-login after registration OTP verification", ipAddress);
            log.info("Auto-login session created for userId={} after registration", user.getUserId());

            return new VerifyOtpResponse(true, purpose, accessToken, rawRefreshToken,
                    "Bearer", JwtService.ACCESS_TOKEN_EXPIRY_SECONDS, userSummary);
        }

        log.info("OTP verified successfully for userId={}, purpose={}", user.getUserId(), purpose);
        return new VerifyOtpResponse(true, purpose);
    }

    @Transactional
    public ResendOtpResponse resendOtp(ResendOtpRequest request) {
        String phone = PhoneUtil.normalize(request.getPhone());
        OtpPurpose purpose = request.getPurpose();
        log.info("Resend OTP request for phone={}, purpose={}", phone, purpose);

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new NotFoundException("No account found for this phone number"));

        if (purpose == OtpPurpose.REGISTER && user.isVerified()) {
            log.warn("Resend OTP for already-verified userId={}", user.getUserId());
            throw new ConflictException("Account is already verified");
        }

        String cooldownKey = "otp:resend:" + user.getUserId() + ":" + purpose.name();
        if (Boolean.TRUE.equals(redis.hasKey(cooldownKey))) {
            log.warn("Resend OTP rate-limited for userId={}, purpose={}", user.getUserId(), purpose);
            throw new TooManyRequestsException("Please wait " + OTP_RESEND_COOLDOWN_SECONDS + " seconds before requesting another OTP");
        }
        redis.opsForValue().set(cooldownKey, "1", Duration.ofSeconds(OTP_RESEND_COOLDOWN_SECONDS));

        otpVerificationRepository.invalidateActiveOtps(user, purpose);
        log.debug("Invalidated active OTPs for userId={}, purpose={}", user.getUserId(), purpose);

        String otpCode = String.valueOf(100000 + secureRandom.nextInt(900000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        OtpVerification otp = new OtpVerification();
        otp.setUser(user);
        otp.setOtpCode(otpCode);
        otp.setPurpose(purpose);
        otp.setExpiresAt(expiresAt);
        otpVerificationRepository.save(otp);
        log.debug("New OTP saved for userId={}, expiresAt={}", user.getUserId(), expiresAt);

        smsService.sendOtp(phone, otpCode);
        log.info("OTP resent to phone={} for purpose={}", phone, purpose);

        return new ResendOtpResponse(phone, 10);
    }

    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress) {
        String phone = PhoneUtil.normalize(request.getPhone());
        log.info("Login attempt for phone={}", phone);

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new NotFoundException("No account found for this phone number"));

        if (!user.isActive()) {
            log.warn("Login attempt on deactivated account userId={}", user.getUserId());
            throw new IllegalStateException("Account is deactivated. Please contact support");
        }

        if (!user.isVerified()) {
            log.warn("Login attempt on unverified account userId={}", user.getUserId());
            throw new IllegalStateException("Account is not verified. Please verify your phone number first");
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            log.warn("Login blocked — account locked until {} for userId={}", user.getLockedUntil(), user.getUserId());
            throw new IllegalStateException("Account is temporarily locked due to too many failed attempts. Please try again in " + LOCK_MINUTES + " minutes");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_LOGIN_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
                log.warn("Account locked for userId={} after {} failed attempts", user.getUserId(), attempts);
            }
            userRepository.save(user);
            auditLogService.log(user, "LOGIN_FAILED", "Invalid password attempt", ipAddress);
            throw new IllegalArgumentException("Invalid phone number or password");
        }

        // Successful login — clear any lockout state
        if (user.getFailedLoginAttempts() > 0 || user.getLockedUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);
        }

        
        String rawRefreshToken = UUID.randomUUID().toString();
        // Revoke any existing active session for this user+device before creating a new one.
        // This prevents duplicate non-revoked rows from accumulating (the old findByUser...orElse
        // pattern silently created new rows every time deviceInfo was null due to JPQL null-equality).
        refreshTokenRepository.revokeByUserAndDevice(user.getUserId(), request.getDeviceInfo(), LocalDateTime.now());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hashToken(rawRefreshToken));
        refreshToken.setDeviceInfo(request.getDeviceInfo());
        refreshToken.setIpAddress(ipAddress);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(30));
        refreshTokenRepository.save(refreshToken);

        String accessToken = jwtService.generateAccessToken(user, refreshToken.getTokenId());

        auditLogService.log(user, "LOGIN", "Login from device: " + request.getDeviceInfo(), ipAddress);
        log.info("Login successful for userId={}", user.getUserId());

        boolean isPaid = subscriptionRepository.existsByUserAndStatus(user, SubscriptionStatus.ACTIVE);
        boolean onboardingComplete = userTaxProfileRepository.findByUser(user)
                .map(p -> Boolean.TRUE.equals(p.getOnboardingComplete())
                        || (user.getTin() != null && !user.getTin().isBlank() && p.getTaxYearStart() != null))
                .orElse(false);
        UserSummary userSummary = new UserSummary(
                user.getUserId(),
                user.getFullName(),
                user.getPhone(),
                isPaid ? SubscriptionTier.PAID.name() : SubscriptionTier.FREE.name(),
                onboardingComplete
        );

        return new LoginResponse(accessToken, rawRefreshToken, "Bearer", JwtService.ACCESS_TOKEN_EXPIRY_SECONDS, false, userSummary);
    }

    @Transactional
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        String hash = hashToken(request.getRefreshToken());
        log.info("Refresh token attempt");

        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (token.getRevoked()) {
            log.warn("Revoked refresh token used for userId={}", token.getUser().getUserId());
            throw new IllegalArgumentException("Refresh token has been revoked");
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Expired refresh token used for userId={}", token.getUser().getUserId());
            throw new IllegalArgumentException("Refresh token has expired. Please log in again");
        }

        String newAccessToken = jwtService.generateAccessToken(token.getUser(), token.getTokenId());
        log.info("Access token refreshed for userId={}", token.getUser().getUserId());

        return new RefreshTokenResponse(newAccessToken, "Bearer", 900);
    }

    @Transactional
    public LogoutResponse logout(RefreshTokenRequest request, String ipAddress) {
        String hash = hashToken(request.getRefreshToken());
        log.info("Logout attempt");

        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (token.getRevoked()) {
            log.warn("Already-revoked token used in logout for userId={}", token.getUser().getUserId());
            throw new IllegalArgumentException("Refresh token already revoked");
        }

        token.setRevoked(true);
        token.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);

        auditLogService.log(token.getUser(), "LOGOUT", "Session revoked", ipAddress);
        log.info("Logout successful for userId={}", token.getUser().getUserId());
        return new LogoutResponse("Logged out successfully");
    }

    @Transactional
    public RegisterBiometricResponse registerBiometric(RegisterBiometricRequest request, User user, String ipAddress) {
        log.info("Biometric registration for userId={}, device={}", user.getUserId(), request.getDeviceInfo());

        String tokenHash = hashToken(request.getBiometricToken());

        DeviceToken deviceToken = new DeviceToken();
        deviceToken.setUser(user);
        deviceToken.setTokenHash(tokenHash);
        deviceToken.setDeviceInfo(request.getDeviceInfo());
        deviceTokenRepository.save(deviceToken);

        auditLogService.log(user, "BIOMETRIC_REGISTERED", "Device: " + request.getDeviceInfo(), ipAddress);
        log.info("Biometric registered for userId={}", user.getUserId());
        return new RegisterBiometricResponse(true, request.getDeviceInfo());
    }

    @Transactional
    public BiometricLoginResponse biometricLogin(BiometricLoginRequest request, String ipAddress) {
        log.info("Biometric login attempt from device={}", request.getDeviceInfo());

        String tokenHash = hashToken(request.getBiometricToken());

        DeviceToken deviceToken = deviceTokenRepository
                .findByTokenHashAndIsActive(tokenHash, true)
                .orElseThrow(() -> new IllegalArgumentException("Biometric token not recognised. Please log in with your password"));

        User user = deviceToken.getUser();

        if (!user.isActive()) {
            log.warn("Biometric login on deactivated account userId={}", user.getUserId());
            throw new IllegalStateException("Account is deactivated. Please contact support");
        }

        if (!user.isVerified()) {
            log.warn("Biometric login on unverified account userId={}", user.getUserId());
            throw new IllegalStateException("Account is not verified. Please verify your phone number first");
        }

        
        String rawRefreshToken = UUID.randomUUID().toString();
        refreshTokenRepository.revokeByUserAndDevice(user.getUserId(), request.getDeviceInfo(), LocalDateTime.now());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hashToken(rawRefreshToken));
        refreshToken.setDeviceInfo(request.getDeviceInfo());
        refreshToken.setIpAddress(ipAddress);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(30));
        refreshTokenRepository.save(refreshToken);

        String accessToken = jwtService.generateAccessToken(user, refreshToken.getTokenId());

        auditLogService.log(user, "BIOMETRIC_LOGIN", "Device: " + request.getDeviceInfo(), ipAddress);
        log.info("Biometric login successful for userId={}", user.getUserId());

        boolean isPaid = subscriptionRepository.existsByUserAndStatus(user, SubscriptionStatus.ACTIVE);
        boolean onboardingComplete = userTaxProfileRepository.findByUser(user)
                .map(p -> Boolean.TRUE.equals(p.getOnboardingComplete())
                        || (user.getTin() != null && !user.getTin().isBlank() && p.getTaxYearStart() != null))
                .orElse(false);
        UserSummary userSummary = new UserSummary(
                user.getUserId(),
                user.getFullName(),
                user.getPhone(),
                isPaid ? SubscriptionTier.PAID.name() : SubscriptionTier.FREE.name(),
                onboardingComplete
        );

        return new BiometricLoginResponse(accessToken, rawRefreshToken, "Bearer", JwtService.ACCESS_TOKEN_EXPIRY_SECONDS, userSummary);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    @Transactional
    public void forgotPassword(String phone){
        phone = PhoneUtil.normalize(phone);
        OtpPurpose purpose = OtpPurpose.PASSWORD_RESET;

        Optional<User> userOpt = userRepository.findByPhone(phone);

        if(userOpt.isEmpty()){
            log.warn("User not found for this phone number={}: ", phone);
        }else{
            User user=userOpt.get();

            if (!user.isVerified()) {
                log.warn("Password reset requested for unverified account userId={}", user.getUserId());
                return; // silently ignore — unverified accounts cannot reset password
            }

            otpVerificationRepository.invalidateActiveOtps(user, purpose);
            log.debug("Invalidated active OTPs for userId={}, purpose={}", user.getUserId(), purpose);

            String otpCode = String.valueOf(100000 + secureRandom.nextInt(900000));
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

            OtpVerification otp = new OtpVerification();
            otp.setUser(user);
            otp.setOtpCode(otpCode);
            otp.setPurpose(purpose);
            otp.setExpiresAt(expiresAt);
            otpVerificationRepository.save(otp);
            log.debug("New OTP saved for userId={}, expiresAt={}", user.getUserId(), expiresAt);

            smsService.sendOtp(phone, otpCode);
            log.info("OTP sent to phone={} for purpose={}", phone, purpose);

            return;
        }
    }

    public VerifyResetOtpResponse verifyResetOtp(String phone, String otpCode){
        phone = PhoneUtil.normalize(phone);
        OtpPurpose purpose = OtpPurpose.PASSWORD_RESET;

        log.info("OTP verification attempt for phone={}, purpose={}", phone, purpose);

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new NotFoundException("No account found for this phone number"));

        OtpVerification otp = otpVerificationRepository
                .findFirstByPurposeAndUserAndUsedOrderByCreatedAtDesc(purpose, user, false)
                .orElseThrow(() -> new BadRequestException("No active OTP found. Please request a new one"));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("OTP expired for userId={}", user.getUserId());
            throw new IllegalStateException("OTP has expired. Please request a new one");
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            log.warn("Invalid OTP code submitted for userId={}", user.getUserId());
            throw new IllegalArgumentException("Invalid OTP code");
        }

        otp.setUsed(true);

        String token = jwtService.generateResetToken(user);

        String hash = hashToken(token);

        otp.setResetTokenHash(hash);

        otpVerificationRepository.save(otp);

        log.info("OTP verified successfully for userId={}, purpose={}", user.getUserId(), purpose);
        return new VerifyResetOtpResponse(token, 15);
    }


    @Transactional
    public void resetPassword(String resetToken, String newPassword, String confirmPassword, String ipAddress){
        if(!newPassword.equals(confirmPassword)){
            log.warn("New password is not equal to Confirm password");
            throw new IllegalStateException("Passwords do not match");
        }

        Claims claims = jwtService.validateResetToken(resetToken);
        String userId = claims.getSubject();

        Optional<User> userOpt = userRepository.findById(UUID.fromString(userId));

        if(userOpt.isEmpty()){
            log.warn("User ID not found={}", userId);
            throw new NotFoundException("User not found");
        }

        User user = userOpt.get();
        
        String hash = hashToken(resetToken);

        Optional<OtpVerification> otpOpt = otpVerificationRepository.findByUserAndPurposeAndResetTokenHash(user, OtpPurpose.PASSWORD_RESET, hash);

        if(otpOpt.isEmpty()){
            throw new IllegalArgumentException("The reset token is invalid or has already been used");
        }

        OtpVerification otp = otpOpt.get();
         

        otp.setResetTokenHash(null);

        otpVerificationRepository.save(otp);

        user.setPasswordHash(passwordEncoder.encode(newPassword));

        userRepository.save(user);

        refreshTokenRepository.revokeAllByUser(user);

        auditLogService.log(user, "PASSWORD_RESET", "Password reset successfully", ipAddress);
        if (user.getEmail() != null) {
            emailService.sendPasswordReset(user.getEmail(), user.getFullName());
        }
        log.info("Password has been reset for user={}", user);
    }
}
