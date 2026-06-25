package com.taxpadi.api.scheduler;

import com.taxpadi.api.model.NotificationType;
import com.taxpadi.api.model.TaxDeadline;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.TaxDeadlineRepository;
import com.taxpadi.api.repository.UserRepository;
import com.taxpadi.api.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class DeadlineNotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(DeadlineNotificationScheduler.class);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("d MMMM yyyy");

    private final TaxDeadlineRepository deadlineRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    public DeadlineNotificationScheduler(TaxDeadlineRepository deadlineRepo,
                                          UserRepository userRepo,
                                          NotificationService notificationService) {
        this.deadlineRepo        = deadlineRepo;
        this.userRepo            = userRepo;
        this.notificationService = notificationService;
    }

    // Runs daily at 8am — sends reminders 7 days and 1 day before each deadline
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDeadlineReminders() {
        LocalDate today = LocalDate.now();
        LocalDate in7Days = today.plusDays(7);
        LocalDate tomorrow = today.plusDays(1);

        List<TaxDeadline> deadlines = deadlineRepo.findByIsActiveTrue();
        List<User> users = userRepo.findAll();

        for (TaxDeadline deadline : deadlines) {
            LocalDate due = deadline.getDueDate();
            if (due == null) continue;

            if (due.equals(in7Days)) {
                String taxLabel = deadline.getTaxType().replace("_", " ").replace("-", " ");
                for (User user : users) {
                    notificationService.send(user,
                        "Tax Deadline in 7 Days",
                        "Your " + taxLabel + " filing is due on " + due.format(FMT) + ". Make sure you're prepared.",
                        NotificationType.DEADLINE,
                        "/tax/deadlines");
                }
                log.info("DeadlineNotificationScheduler: sent 7-day reminders for {}", deadline.getTaxType());
            }

            if (due.equals(tomorrow)) {
                String taxLabel = deadline.getTaxType().replace("_", " ").replace("-", " ");
                for (User user : users) {
                    notificationService.send(user,
                        "Tax Deadline Tomorrow",
                        "Your " + taxLabel + " filing is due tomorrow, " + due.format(FMT) + ". File now to avoid penalties.",
                        NotificationType.DEADLINE,
                        "/tax/deadlines");
                }
                log.info("DeadlineNotificationScheduler: sent 1-day reminders for {}", deadline.getTaxType());
            }
        }
    }
}
