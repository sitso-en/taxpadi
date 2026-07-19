package com.taxpadi.api.dto.tax;

import java.math.BigDecimal;

public class VatRateInfo {

    private String standardRate;
    private String nhilLevy;
    private String getfundLevy;
    private String effectiveRate;
    private BigDecimal registrationThresholdGoods;
    private String registrationThresholdServices;
    private String filingFrequency;
    private String filingDeadline;

    public VatRateInfo() {}

    public VatRateInfo(String standardRate, String nhilLevy, String getfundLevy, String effectiveRate,
                       BigDecimal registrationThresholdGoods, String registrationThresholdServices,
                       String filingFrequency, String filingDeadline) {
        this.standardRate = standardRate;
        this.nhilLevy = nhilLevy;
        this.getfundLevy = getfundLevy;
        this.effectiveRate = effectiveRate;
        this.registrationThresholdGoods = registrationThresholdGoods;
        this.registrationThresholdServices = registrationThresholdServices;
        this.filingFrequency = filingFrequency;
        this.filingDeadline = filingDeadline;
    }

    public String getStandardRate() { return standardRate; }
    public void setStandardRate(String standardRate) { this.standardRate = standardRate; }

    public String getNhilLevy() { return nhilLevy; }
    public void setNhilLevy(String nhilLevy) { this.nhilLevy = nhilLevy; }

    public String getGetfundLevy() { return getfundLevy; }
    public void setGetfundLevy(String getfundLevy) { this.getfundLevy = getfundLevy; }

    public String getEffectiveRate() { return effectiveRate; }
    public void setEffectiveRate(String effectiveRate) { this.effectiveRate = effectiveRate; }

    public BigDecimal getRegistrationThresholdGoods() { return registrationThresholdGoods; }
    public void setRegistrationThresholdGoods(BigDecimal registrationThresholdGoods) { this.registrationThresholdGoods = registrationThresholdGoods; }

    public String getRegistrationThresholdServices() { return registrationThresholdServices; }
    public void setRegistrationThresholdServices(String registrationThresholdServices) { this.registrationThresholdServices = registrationThresholdServices; }

    public String getFilingFrequency() { return filingFrequency; }
    public void setFilingFrequency(String filingFrequency) { this.filingFrequency = filingFrequency; }

    public String getFilingDeadline() { return filingDeadline; }
    public void setFilingDeadline(String filingDeadline) { this.filingDeadline = filingDeadline; }
}
