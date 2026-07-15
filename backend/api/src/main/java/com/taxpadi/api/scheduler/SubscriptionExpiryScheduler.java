package com.taxpadi.api.scheduler;

import com.taxpadi.api.constant.SubscriptionStatus;
import com.taxpadi.api.model.NotificationType;
import com.taxpadi.api.model.Subscription;
import com.taxpadi.api.model.SubscriptionTier;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.SubscriptionRepository;
import com.taxpadi.api.repository.UserRepository;
import com.taxpadi.api.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class SubscriptionExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionExpiryScheduler.class);

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SubscriptionExpiryScheduler(SubscriptionRepository subscriptionRepository,
                                       UserRepository userRepository,
                                       NotificationService notificationService) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // Runs daily at 2am
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void expireSubscriptions() {
        LocalDateTime now = LocalDateTime.now();
        log.info("SubscriptionExpiryScheduler: checking for expired subscriptions at {}", now);

        List<Subscription> expired = subscriptionRepository.findExpired(
            SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED, now);

        for (Subscription sub : expired) {
            User user = sub.getUser();

            sub.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(sub);

            user.setSubscriptionTier(SubscriptionTier.FREE);
            userRepository.save(user);

            notificationService.send(user,
                "Subscription Expired",
                "Your TaxPadi paid subscription has expired. Renew to continue accessing PAYE, Savings Vault, and Referral Offers.",
                NotificationType.SYSTEM,
                "/subscription");

            log.info("SubscriptionExpiryScheduler: expired subscription for userId={}", user.getUserId());
        }

        log.info("SubscriptionExpiryScheduler: processed {} expired subscriptions", expired.size());
    }
}
