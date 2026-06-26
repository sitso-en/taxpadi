package com.taxpadi.api.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "tax_deadlines")
public class TaxDeadline {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "deadline_id")
    private UUID deadlineId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String taxType;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private String frequency;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String applicableTo;

    private String penaltyDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDate periodStart;

    private LocalDate periodEnd;

    private boolean completed = false;

    private LocalDateTime completedAt;

    private boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getDeadlineId() { return deadlineId; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getTaxType() { return taxType; }
    public void setTaxType(String v) { this.taxType = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate v) { this.dueDate = v; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String v) { this.frequency = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public String getApplicableTo() { return applicableTo; }
    public void setApplicableTo(String v) { this.applicableTo = v; }
    public String getPenaltyDescription() { return penaltyDescription; }
    public void setPenaltyDescription(String v) { this.penaltyDescription = v; }
    public User getUser() { return user; }
    public void setUser(User v) { this.user = v; }
    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate v) { this.periodStart = v; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate v) { this.periodEnd = v; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean v) {
        this.completed = v;
        if (v) this.status = "COMPLETED";
    }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime v) { this.completedAt = v; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean v) { this.isActive = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
