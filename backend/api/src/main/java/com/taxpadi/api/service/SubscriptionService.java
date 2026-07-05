package com.taxpadi.api.service;

import com.taxpadi.api.dto.subscription.CancelSubscriptionResponse;
import com.taxpadi.api.dto.subscription.SubscribeRequest;
import com.taxpadi.api.dto.subscription.SubscribeResponse;
import com.taxpadi.api.dto.subscription.SubscriptionFeaturesDto;
import com.taxpadi.api.dto.subscription.SubscriptionStatusDto;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ConflictException;
import com.taxpadi.api.model.Subscription;
import com.taxpadi.api.model.SubscriptionTier;
import com.taxpadi.api.model.User;
import com.taxpadi.api.constant.SubscriptionPlan;
import com.taxpadi.api.constant.SubscriptionStatus;
import com.taxpadi.api.constant.PaymentMethod;
import com.taxpadi.api.repository.SubscriptionRepository;
import com.taxpadi.api.repository.UserRepository;
import com.taxpadi.api.service.PaystackService.PaystackInitResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class SubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionService.class);

    private final SubscriptionRepository subscriptionRepository;
    private final PaystackService paystackService;
    private final UserRepository userRepository;

    @Value("${paystack.secret-key:}")
    private String paystackSecretKey;

    @Value("${subscription.price.monthly:50.00}")
    private BigDecimal monthlyPrice;

    @Value("${subscription.price.annual:500.00}")
    private BigDecimal annualPrice;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, PaystackService paystackService,
                               UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.paystackService = paystackService;
        this.userRepository = userRepository;
    }

    @Cacheable("subscription-plans")
    public List<Map<String, Object>> getPlans() {
        return List.of(
            Map.of(
                "plan", SubscriptionPlan.MONTHLY,
                "price", monthlyPrice,
                "currency", "GHS",
                "billing_cycle", "Every 30 days",
                "features", List.of(
                    "Unlimited transactions",
                    "Tax calculations (Income, VAT, PAYE)",
                    "Tax return filing",
                    "Invoice generation",
                    "Savings vault",
                    "TaxBot AI assistant",
                    "Up to 3 profiles"
                )
            ),
            Map.of(
                "plan", SubscriptionPlan.ANNUAL,
                "price", annualPrice,
                "currency", "GHS",
                "billing_cycle", "Every 365 days",
                "savings", monthlyPrice.multiply(BigDecimal.valueOf(12)).subtract(annualPrice) + " GHS saved vs monthly",
                "features", List.of(
                    "Everything in monthly",
                    "2 months free",
                    "Priority support"
                )
            )
        );
    }

    public SubscriptionStatusDto getStatus(User user) {
        Optional<Subscription> activeOpt = subscriptionRepository.findByUserAndStatus(user, SubscriptionStatus.ACTIVE);

        SubscriptionStatusDto dto = new SubscriptionStatusDto();

        if (activeOpt.isPresent()) {
            Subscription sub = activeOpt.get();
            dto.setSubscriptionTier("paid");
            dto.setStatus(SubscriptionStatus.ACTIVE);
            dto.setStartedAt(sub.getStartedAt());
            dto.setExpiresAt(sub.getExpiresAt());
            dto.setAutoRenew(sub.getAutoRenew());
            dto.setFeatures(new SubscriptionFeaturesDto(true));
        } else {
            Optional<Subscription> cancelledOpt = subscriptionRepository.findByUserAndStatus(user, SubscriptionStatus.CANCELLED);
            if (cancelledOpt.isPresent() &&
                    cancelledOpt.get().getExpiresAt() != null &&
                    cancelledOpt.get().getExpiresAt().isAfter(LocalDateTime.now())) {
                Subscription sub = cancelledOpt.get();
                dto.setSubscriptionTier("paid");
                dto.setStatus(SubscriptionStatus.CANCELLED);
                dto.setStartedAt(sub.getStartedAt());
                dto.setExpiresAt(sub.getExpiresAt());
                dto.setAutoRenew(false);
                dto.setFeatures(new SubscriptionFeaturesDto(true));
            } else {
                dto.setSubscriptionTier("free");
                dto.setStatus(SubscriptionStatus.ACTIVE);
                dto.setFeatures(new SubscriptionFeaturesDto(false));
            }
        }
        return dto;
    }

    @Transactional
    public SubscribeResponse subscribe(User user, SubscribeRequest request) {
        String plan = request.getPlan();
        String paymentMethod = request.getPaymentMethod();
        String momoNumber = request.getMomoNumber();
        String momoProvider = request.getMomoProvider();

        if (plan == null || (!plan.equals(SubscriptionPlan.MONTHLY) && !plan.equals(SubscriptionPlan.ANNUAL)))
            throw new BadRequestException("Plan must be monthly or annual");
        if (paymentMethod == null || (!paymentMethod.equals(PaymentMethod.MOMO) && !paymentMethod.equals(PaymentMethod.BANK_CARD)))
            throw new BadRequestException("Payment method must be momo or bank_card");
        if (PaymentMethod.MOMO.equals(paymentMethod)) {
            if (momoNumber == null || momoNumber.isBlank())
                throw new BadRequestException("momo_number is required when payment_method is momo");
            List<String> validProviders = List.of("mtn", "telecel", "airteltigo");
            if (momoProvider == null || !validProviders.contains(momoProvider))
                throw new BadRequestException("momo_provider must be one of: mtn, telecel, airteltigo");
        }

        if (subscriptionRepository.existsByUserAndStatus(user, SubscriptionStatus.ACTIVE))
            throw new ConflictException("You already have an active paid subscription");

        boolean isMonthly = SubscriptionPlan.MONTHLY.equals(plan);
        BigDecimal amount = isMonthly ? monthlyPrice : annualPrice;
        String paymentReference = "SUB-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setPlan(plan);
        sub.setStatus(SubscriptionStatus.PENDING);
        sub.setSubscriptionTier(SubscriptionTier.FREE);
        sub.setPaymentMethod(paymentMethod);
        sub.setAmount(amount);
        sub.setPaymentReference(paymentReference);
        sub.setMomoNumber(momoNumber);
        sub.setAutoRenew(true);
        subscriptionRepository.save(sub);

        // If Paystack is not configured, activate immediately (dev/test mode)
        if (paystackSecretKey == null || paystackSecretKey.isBlank()) {
            log.warn("Paystack not configured — activating subscription immediately (dev mode)");
            LocalDateTime now = LocalDateTime.now();
            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setSubscriptionTier(SubscriptionTier.PAID);
            sub.setStartedAt(now);
            sub.setExpiresAt(isMonthly ? now.plusMonths(1) : now.plusYears(1));
            subscriptionRepository.save(sub);
            user.setSubscriptionTier(SubscriptionTier.PAID);
            userRepository.save(user);

            SubscribeResponse response = new SubscribeResponse();
            response.setSubscriptionId(sub.getSubscriptionId());
            response.setPlan(plan);
            response.setAmount(amount);
            response.setCurrency("GHS");
            response.setPaymentReference(paymentReference);
            response.setStatus(SubscriptionStatus.ACTIVE);
            response.setExpiresAt(sub.getExpiresAt());
            return response;
        }

        // Initiate payment via Paystack
        String authorizationUrl = null;
        if (PaymentMethod.MOMO.equals(paymentMethod)) {
            paystackService.chargeMobileMoney(user.getEmail(), amount, paymentReference, momoNumber, momoProvider);
        } else {
            PaystackInitResult init = paystackService.initialize(
                user.getEmail(), amount, paymentReference, List.of("card"));
            authorizationUrl = init.authorizationUrl;
        }

        SubscribeResponse response = new SubscribeResponse();
        response.setSubscriptionId(sub.getSubscriptionId());
        response.setPlan(plan);
        response.setAmount(amount);
        response.setCurrency("GHS");
        response.setPaymentReference(paymentReference);
        response.setStatus(SubscriptionStatus.PENDING);
        response.setAuthorizationUrl(authorizationUrl);
        return response;
    }

    @Transactional
    public SubscribeResponse verify(User user) {
        Subscription sub = subscriptionRepository.findByUserAndStatus(user, SubscriptionStatus.PENDING)
                .orElseThrow(() -> new BadRequestException("No pending subscription found"));

        if (!paystackService.isSuccessful(sub.getPaymentReference()))
            throw new BadRequestException("Payment has not been confirmed yet. Please approve the prompt on your phone.");

        LocalDateTime now = LocalDateTime.now();
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setSubscriptionTier(SubscriptionTier.PAID);
        sub.setStartedAt(now);
        sub.setExpiresAt(SubscriptionPlan.MONTHLY.equals(sub.getPlan()) ? now.plusMonths(1) : now.plusYears(1));
        subscriptionRepository.save(sub);

        user.setSubscriptionTier(SubscriptionTier.PAID);
        userRepository.save(user);

        SubscribeResponse response = new SubscribeResponse();
        response.setSubscriptionId(sub.getSubscriptionId());
        response.setPlan(sub.getPlan());
        response.setAmount(sub.getAmount());
        response.setCurrency("GHS");
        response.setPaymentReference(sub.getPaymentReference());
        response.setStatus(SubscriptionStatus.ACTIVE);
        response.setExpiresAt(sub.getExpiresAt());
        return response;
    }

    @Transactional
    public CancelSubscriptionResponse cancel(User user, String reason) {
        Subscription sub = subscriptionRepository.findByUserAndStatus(user, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new BadRequestException(
                        "You do not have an active paid subscription to cancel"));

        sub.setStatus(SubscriptionStatus.CANCELLED);
        sub.setAutoRenew(false);
        sub.setCancelledAt(LocalDateTime.now());
        sub.setCancelReason(reason);
        subscriptionRepository.save(sub);

        CancelSubscriptionResponse response = new CancelSubscriptionResponse();
        response.setSubscriptionTier("paid");
        response.setStatus(SubscriptionStatus.CANCELLED);
        response.setAccessUntil(sub.getExpiresAt());
        return response;
    }
}
