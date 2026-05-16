package com.taxpadi.api.dto.tax;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TaxBreakdownItemDto {
    private String taxType;
    private BigDecimal grossIncome;
    private BigDecimal totalDeductions;
    private BigDecimal taxableIncome;
    private BigDecimal taxLiability;
    private LocalDateTime calculatedAt;

    public TaxBreakdownItemDto(String taxType, BigDecimal grossIncome, BigDecimal totalDeductions,
                                BigDecimal taxableIncome, BigDecimal taxLiability, LocalDateTime calculatedAt) {
        this.taxType = taxType;
        this.grossIncome = grossIncome;
        this.totalDeductions = totalDeductions;
        this.taxableIncome = taxableIncome;
        this.taxLiability = taxLiability;
        this.calculatedAt = calculatedAt;
    }

    public String getTaxType(){
         return taxType;
    }

    public BigDecimal getGrossIncome(){
        return grossIncome;
    }

    public BigDecimal getTotalDeductions(){
        return totalDeductions; 
    }
    public BigDecimal getTaxableIncome() 
    { return taxableIncome; 

    }

    public BigDecimal getTaxLiability(){
        return taxLiability;
    }

    public LocalDateTime getCalculatedAt(){
        return calculatedAt; 
    }
}
