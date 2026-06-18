package com.taxpadi.jeffery.service;

import com.taxpadi.jeffery.entity.Subscription;
import com.taxpadi.jeffery.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    @Value("${subscription.price.monthly:50.00}")
    private BigDecimal monthlyPrice;

    @Value("${subscription.price.annual:500.00}")
    private BigDecimal annualPrice;

    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    // GET /api/v1/subscriptions/status
    public Map<String, Object> getStatus(String userId) {
        Optional<Subscription> activeOpt = subscriptionRepository
                .findByUserIdAndStatus(userId, "active");

        Map<String, Object> data = new HashMap<>();

        if (activeOpt.isPresent()) {
            Subscription sub = activeOpt.get();
            data.put("subscription_tier", "paid");
            data.put("status", "active");
            data.put("started_at", sub.getStartedAt());
            data.put("expires_at", sub.getExpiresAt());
            data.put("auto_renew", sub.getAutoRenew());
            data.put("features", paidFeatures());
        } else {
            Optional<Subscription> cancelledOpt = subscriptionRepository
                    .findByUserIdAndStatus(userId, "cancelled");
            if (cancelledOpt.isPresent() &&
                    cancelledOpt.get().getExpiresAt().isAfter(LocalDateTime.now())) {
                Subscription sub = cancelledOpt.get();
                data.put("subscription_tier", "paid");
                data.put("status", "cancelled");
                data.put("started_at", sub.getStartedAt());
                data.put("expires_at", sub.getExpiresAt());
                data.put("auto_renew", false);
                data.put("features", paidFeatures());
            } else {
                data.put("subscription_tier", "free");
                data.put("status", "active");
                data.put("started_at", null);
                data.put("expires_at", null);
                data.put("auto_renew", null);
                data.put("features", freeFeatures());
            }
        }
        return data;
    }

    // POST /api/v1/subscriptions/subscribe
    @Transactional
    public Map<String, Object> subscribe(String userId, Map<String, Object> request) {
        String plan = (String) request.get("plan");
        String paymentMethod = (String) request.get("payment_method");
        String momoNumber = (String) request.get("momo_number");

        // Validate
        if (plan == null || (!plan.equals("monthly") && !plan.equals("annual")))
            throw new ValidationException("Plan must be monthly or annual");
        if (paymentMethod == null || (!paymentMethod.equals("momo") && !paymentMethod.equals("bank_card")))
            throw new ValidationException("Payment method must be momo or bank_card");
        if ("momo".equals(paymentMethod) && (momoNumber == null || momoNumber.isBlank()))
            throw new ValidationException("momo_number is required when payment_method is momo");

        // Check already subscribed
        if (subscriptionRepository.existsByUserIdAndStatus(userId, "active"))
            throw new AlreadySubscribedException("You already have an active paid subscription");

        boolean isMonthly = "monthly".equals(plan);
        BigDecimal amount = isMonthly ? monthlyPrice : annualPrice;
        LocalDateTime expiresAt = isMonthly
                ? LocalDateTime.now().plusMonths(1)
                : LocalDateTime.now().plusYears(1);
        String paymentReference = "PAY-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        Subscription sub = new Subscription();
        sub.setUserId(userId);
        sub.setPlan(plan);
        sub.setStatus("active");
        sub.setSubscriptionTier("paid");
        sub.setPaymentMethod(paymentMethod);
        sub.setAmount(amount);
        sub.setPaymentReference(paymentReference);
        sub.setMomoNumber(momoNumber);
        sub.setAutoRenew(true);
        sub.setStartedAt(LocalDateTime.now());
        sub.setExpiresAt(expiresAt);
        Subscription saved = subscriptionRepository.save(sub);

        Map<String, Object> data = new HashMap<>();
        data.put("subscription_id", saved.getId());
        data.put("plan", plan);
        data.put("amount", amount);
        data.put("currency", "GHS");
        data.put("payment_reference", paymentReference);
        data.put("status", "pending");
        data.put("expires_at", expiresAt);
        return data;
    }

    // POST /api/v1/subscriptions/cancel
    @Transactional
    public Map<String, Object> cancel(String userId, String reason) {
        Subscription sub = subscriptionRepository
                .findByUserIdAndStatus(userId, "active")
                .orElseThrow(() -> new NoActiveSubscriptionException(
                        "You do not have an active paid subscription to cancel"));

        sub.setStatus("cancelled");
        sub.setAutoRenew(false);
        sub.setCancelledAt(LocalDateTime.now());
        sub.setCancelReason(reason);
        sub.setUpdatedAt(LocalDateTime.now());
        subscriptionRepository.save(sub);

        Map<String, Object> data = new HashMap<>();
        data.put("subscription_tier", "paid");
        data.put("status", "cancelled");
        data.put("access_until", sub.getExpiresAt());
        return data;
    }

    private Map<String, Object> paidFeatures() {
        Map<String, Object> f = new HashMap<>();
        f.put("vat_management", true);
        f.put("paye_management", true);
        f.put("auto_filing", true);
        f.put("tax_savings_vault", true);
        f.put("advanced_reports", true);
        f.put("invoice_generator", true);
        f.put("referral_offers", true);
        return f;
    }

    private Map<String, Object> freeFeatures() {
        Map<String, Object> f = new HashMap<>();
        f.put("vat_management", false);
        f.put("paye_management", false);
        f.put("auto_filing", false);
        f.put("tax_savings_vault", false);
        f.put("advanced_reports", false);
        f.put("invoice_generator", false);
        f.put("referral_offers", false);
        return f;
    }

    // Custom exceptions
    public static class AlreadySubscribedException extends RuntimeException {
        public AlreadySubscribedException(String msg) { super(msg); }
    }
    public static class NoActiveSubscriptionException extends RuntimeException {
        public NoActiveSubscriptionException(String msg) { super(msg); }
    }
    public static class ValidationException extends RuntimeException {
        public ValidationException(String msg) { super(msg); }
    }
}