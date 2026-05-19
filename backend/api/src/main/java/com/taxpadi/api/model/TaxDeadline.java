package com.taxpadi.api.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity                                                                                                                                                                                       
  @Table(name = "tax_deadlines",
      uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "tax_type", "period_start", "period_end"}))
  public class TaxDeadline {

      @Id
      @GeneratedValue(strategy = GenerationType.AUTO)
      @Column(name = "deadline_id", updatable = false, nullable = false)
      private UUID deadlineId;

      @ManyToOne(fetch = FetchType.LAZY, optional = false)
      @JoinColumn(name = "user_id", nullable = false)
      private User user;

      @Column(name = "tax_type", nullable = false, length = 20)
      private String taxType;

      @Column(name = "deadline_date", nullable = false)
      private LocalDate deadlineDate;

      @Column(name = "period_start", nullable = false)
      private LocalDate periodStart;

      @Column(name = "period_end", nullable = false)
      private LocalDate periodEnd;

      @Column(length = 255)
      private String description;

      @Column(name = "reminder_sent", nullable = false)
      private Boolean reminderSent = false;

      @Column(nullable = false)
      private Boolean completed = false;

      @Column(name = "completed_at")
      private LocalDateTime completedAt;

      @Column(name = "created_at", nullable = false, updatable = false)
      private LocalDateTime createdAt;

      @PrePersist
      protected void onCreate() {
          createdAt = LocalDateTime.now();
      }


      public UUID getDeadlineId() {
          return deadlineId;
      }

      public User getUser() {
          return user;
      }

      public void setUser(User user) {
          this.user = user;
      }

      public String getTaxType() {
          return taxType;
      }

      public void setTaxType(String taxType) {
          this.taxType = taxType;
      }

      public LocalDate getDeadlineDate() {
          return deadlineDate;
      }

      public void setDeadlineDate(LocalDate deadlineDate) {
          this.deadlineDate = deadlineDate;
      }

      public LocalDate getPeriodStart() {
          return periodStart;
      }

      public void setPeriodStart(LocalDate periodStart) {
          this.periodStart = periodStart;
      }

      public LocalDate getPeriodEnd() {
          return periodEnd;
      }

      public void setPeriodEnd(LocalDate periodEnd) {
          this.periodEnd = periodEnd;
      }

      public String getDescription() {
          return description;
      }

      public void setDescription(String description) {
          this.description = description;
      }

      public Boolean getReminderSent() {
          return reminderSent;
      }

      public void setReminderSent(Boolean reminderSent) {
          this.reminderSent = reminderSent;
      }

      public Boolean getCompleted() {
          return completed;
      }

      public void setCompleted(Boolean completed) {
          this.completed = completed;
      }

      public LocalDateTime getCompletedAt() {
          return completedAt;
      }

      public void setCompletedAt(LocalDateTime completedAt) {
          this.completedAt = completedAt;
      }

      public LocalDateTime getCreatedAt() {
          return createdAt;
      }
      
      
  }
