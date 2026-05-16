package com.taxpadi.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vat_records",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "month", "year"}))
public class VatRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "vat_id", updatable = false, nullable = false)
    private UUID vatId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "total_sales", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalSales;

    @Column(name = "output_vat", nullable = false, precision = 15, scale = 2)
    private BigDecimal outputVat;

    @Column(name = "total_purchases", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPurchases;

    @Column(name = "input_vat", nullable = false, precision = 15, scale = 2)
    private BigDecimal inputVat;

    @Column(name = "net_vat_liability", nullable = false, precision = 15, scale = 2)
    private BigDecimal netVatLiability;

    @Column(name = "return_status", nullable = false, length = 20)
    private String returnStatus; // PENDING, FILED, OVERDUE

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

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

    public UUID getVatId() { return vatId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }
    public BigDecimal getOutputVat() { return outputVat; }
    public void setOutputVat(BigDecimal outputVat) { this.outputVat = outputVat; }
    public BigDecimal getTotalPurchases() { return totalPurchases; }
    public void setTotalPurchases(BigDecimal totalPurchases) { this.totalPurchases = totalPurchases; }
    public BigDecimal getInputVat() { return inputVat; }
    public void setInputVat(BigDecimal inputVat) { this.inputVat = inputVat; }
    public BigDecimal getNetVatLiability() { return netVatLiability; }
    public void setNetVatLiability(BigDecimal netVatLiability) { this.netVatLiability = netVatLiability; }
    public String getReturnStatus() { return returnStatus; }
    public void setReturnStatus(String returnStatus) { this.returnStatus = returnStatus; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
