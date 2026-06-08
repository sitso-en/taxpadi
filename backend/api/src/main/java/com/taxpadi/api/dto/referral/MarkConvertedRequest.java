package com.taxpadi.api.dto.referral;

import java.math.BigDecimal;

public class MarkConvertedRequest {

    private String partnerReference;
    private String convertedAt;
    private String productName;
    private BigDecimal amount;

    public String getPartnerReference() { return partnerReference; }
    public void setPartnerReference(String partnerReference) { this.partnerReference = partnerReference; }

    public String getConvertedAt() { return convertedAt; }
    public void setConvertedAt(String convertedAt) { this.convertedAt = convertedAt; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
