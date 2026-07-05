package com.taxpadi.api.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class InitiatePaymentRequest {
    @JsonProperty("return_id")
    private UUID returnId;

    @JsonProperty("penalty_id")
    private UUID penaltyId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotBlank(message = "Payment method is required")
    @JsonProperty("payment_method")
    private String paymentMethod;

    @JsonProperty("momo_number")
    private String momoNumber;

    @JsonProperty("momo_provider")
    private String momoProvider;

    public UUID getReturnId() { return returnId; }
    public void setReturnId(UUID v) { this.returnId = v; }

    public UUID getPenaltyId() { return penaltyId; }
    public void setPenaltyId(UUID v) { this.penaltyId = v; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String v) { this.paymentMethod = v; }

    public String getMomoNumber() { return momoNumber; }
    public void setMomoNumber(String v) { this.momoNumber = v; }

    public String getMomoProvider() { return momoProvider; }
    public void setMomoProvider(String v) { this.momoProvider = v; }
}
