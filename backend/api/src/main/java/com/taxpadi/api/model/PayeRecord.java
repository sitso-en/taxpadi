package com.taxpadi.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "paye_records",
    uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "month", "year"}))
public class PayeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "paye_id", updatable = false, nullable = false)
    private UUID payeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "gross_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "taxable_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxableSalary;

    @Column(name = "paye_deducted", nullable = false, precision = 15, scale = 2)
    private BigDecimal payeDeducted;

    @Column(nullable = false)
    private Boolean remitted = false;

    @Column(name = "remitted_at")
    private LocalDateTime remittedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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

    public UUID getPayeId() { return payeId; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public BigDecimal getGrossSalary() { return grossSalary; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }
    public BigDecimal getTaxableSalary() { return taxableSalary; }
    public void setTaxableSalary(BigDecimal taxableSalary) { this.taxableSalary = taxableSalary; }
    public BigDecimal getPayeDeducted() { return payeDeducted; }
    public void setPayeDeducted(BigDecimal payeDeducted) { this.payeDeducted = payeDeducted; }
    public Boolean getRemitted() { return remitted; }
    public void setRemitted(Boolean remitted) { this.remitted = remitted; }
    public LocalDateTime getRemittedAt() { return remittedAt; }
    public void setRemittedAt(LocalDateTime remittedAt) { this.remittedAt = remittedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
