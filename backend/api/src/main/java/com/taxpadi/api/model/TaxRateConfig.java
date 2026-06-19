package com.taxpadi.api.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "tax_rate_configs")
public class TaxRateConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "config_id")
    private UUID configId;

    @Column(name = "tax_year", nullable = false)
    private int taxYear;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "income_tax_brackets", columnDefinition = "jsonb")
    private List<Map<String, Object>> incomeTaxBrackets;

    @Column(name = "vat_standard_rate", precision = 5, scale = 2)
    private BigDecimal vatStandardRate;

    @Column(name = "vat_nhil_levy", precision = 5, scale = 2)
    private BigDecimal vatNhilLevy;

    @Column(name = "vat_getfund_levy", precision = 5, scale = 2)
    private BigDecimal vatGetfundLevy;

    @Column(name = "vat_covid_levy", precision = 5, scale = 2)
    private BigDecimal vatCovidLevy;

    @Column(name = "vat_registration_threshold", precision = 15, scale = 2)
    private BigDecimal vatRegistrationThreshold;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "withholding_rates", columnDefinition = "jsonb")
    private List<Map<String, Object>> withholdingRates;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getConfigId() { return configId; }

    public int getTaxYear() { return taxYear; }
    public void setTaxYear(int taxYear) { this.taxYear = taxYear; }

    public List<Map<String, Object>> getIncomeTaxBrackets() { return incomeTaxBrackets; }
    public void setIncomeTaxBrackets(List<Map<String, Object>> incomeTaxBrackets) { this.incomeTaxBrackets = incomeTaxBrackets; }

    public BigDecimal getVatStandardRate() { return vatStandardRate; }
    public void setVatStandardRate(BigDecimal vatStandardRate) { this.vatStandardRate = vatStandardRate; }

    public BigDecimal getVatNhilLevy() { return vatNhilLevy; }
    public void setVatNhilLevy(BigDecimal vatNhilLevy) { this.vatNhilLevy = vatNhilLevy; }

    public BigDecimal getVatGetfundLevy() { return vatGetfundLevy; }
    public void setVatGetfundLevy(BigDecimal vatGetfundLevy) { this.vatGetfundLevy = vatGetfundLevy; }

    public BigDecimal getVatCovidLevy() { return vatCovidLevy; }
    public void setVatCovidLevy(BigDecimal vatCovidLevy) { this.vatCovidLevy = vatCovidLevy; }

    public BigDecimal getVatRegistrationThreshold() { return vatRegistrationThreshold; }
    public void setVatRegistrationThreshold(BigDecimal vatRegistrationThreshold) { this.vatRegistrationThreshold = vatRegistrationThreshold; }

    public List<Map<String, Object>> getWithholdingRates() { return withholdingRates; }
    public void setWithholdingRates(List<Map<String, Object>> withholdingRates) { this.withholdingRates = withholdingRates; }

    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
