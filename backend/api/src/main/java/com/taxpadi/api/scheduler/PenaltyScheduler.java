package com.taxpadi.api.scheduler;

import com.taxpadi.api.model.NotificationType;
import com.taxpadi.api.model.Penalty;
import com.taxpadi.api.model.UserTaxProfile;
import com.taxpadi.api.repository.PenaltyRepository;
import com.taxpadi.api.repository.TaxDeadlineRepository;
import com.taxpadi.api.repository.UserTaxProfileRepository;
import com.taxpadi.api.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Component
public class PenaltyScheduler {

    private static final Logger log = LoggerFactory.getLogger(PenaltyScheduler.class);

    private static final BigDecimal INCOME_TAX_BASE    = new BigDecimal("200.00");
    private static final BigDecimal INCOME_TAX_DAILY   = new BigDecimal("20.00");
    private static final BigDecimal INTEREST_RATE      = new BigDecimal("0.075");

    private final TaxDeadlineRepository deadlineRepo;
    private final UserTaxProfileRepository profileRepo;
    private final PenaltyRepository penaltyRepo;
    private final NotificationService notificationService;

    public PenaltyScheduler(TaxDeadlineRepository deadlineRepo,
                             UserTaxProfileRepository profileRepo,
                             PenaltyRepository penaltyRepo,
                             NotificationService notificationService) {
        this.deadlineRepo        = deadlineRepo;
        this.profileRepo         = profileRepo;
        this.penaltyRepo         = penaltyRepo;
        this.notificationService = notificationService;
    }

    // Runs daily at 1am
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void applyOverduePenalties() {
        LocalDate today = LocalDate.now();
        log.info("PenaltyScheduler: checking overdue deadlines for {}", today);

        List<UserTaxProfile> profiles = profileRepo.findAll();

        deadlineRepo.findByIsActiveTrue().stream()
            .filter(d -> d.getDueDate() != null && d.getDueDate().isBefore(today))
            .forEach(deadline -> {
                String taxType = deadline.getTaxType();

                profiles.stream()
                    .filter(profile -> isApplicable(profile, taxType))
                    .forEach(profile -> {
                        var user = profile.getUser();
                        if (penaltyRepo.existsByUserAndTaxTypeAndStatus(user, taxType, "OUTSTANDING")) {
                            return; // already has one
                        }

                        int daysLate = (int) ChronoUnit.DAYS.between(deadline.getDueDate(), today);
                        BigDecimal daily    = INCOME_TAX_DAILY.multiply(BigDecimal.valueOf(daysLate));
                        BigDecimal interest = INCOME_TAX_BASE.multiply(INTEREST_RATE).setScale(2, RoundingMode.HALF_UP);
                        BigDecimal total    = INCOME_TAX_BASE.add(daily).add(interest);

                        Penalty p = new Penalty();
                        p.setUser(user);
                        p.setTaxType(taxType);
                        p.setPenaltyType("LATE_FILING");
                        p.setPenaltyAmount(total);
                        p.setPenaltyRate(INTEREST_RATE);
                        p.setDueDate(deadline.getDueDate());
                        p.setFilingDate(today);
                        p.setDaysLate(daysLate);
                        p.setStatus("OUTSTANDING");
                        p.setOriginalTaxAmount(BigDecimal.ZERO);
                        p.setDescription("Late filing penalty for " + taxType + " — " + daysLate + " day(s) overdue.");
                        p.setReferenceNumber("PEN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                        penaltyRepo.save(p);

                        notificationService.send(user,
                            "Late Filing Penalty Applied",
                            "A penalty of GHS " + total + " has been applied for late " + taxType + " filing. You are " + daysLate + " day(s) overdue.",
                            NotificationType.PENALTY,
                            "/penalties/" + p.getPenaltyId());

                        log.info("PenaltyScheduler: created penalty for user={} taxType={} daysLate={}",
                                user.getUserId(), taxType, daysLate);
                    });
            });

        log.info("PenaltyScheduler: done");
    }

    private boolean isApplicable(UserTaxProfile profile, String taxType) {
        return switch (taxType.toLowerCase()) {
            case "vat"        -> Boolean.TRUE.equals(profile.getVatRegistered());
            case "paye"       -> Boolean.TRUE.equals(profile.getPayeRegistered());
            case "income_tax", "income-tax" -> true; // all taxpayers
            default           -> true;
        };
    }
}
