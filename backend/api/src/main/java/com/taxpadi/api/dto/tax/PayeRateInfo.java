package com.taxpadi.api.dto.tax;

import java.util.List;

public class PayeRateInfo {

    private List<TaxBracketDto> brackets;
    private String remittanceDeadline;
    private String annualReturnDeadline;

    public PayeRateInfo() {}

    public PayeRateInfo(List<TaxBracketDto> brackets, String remittanceDeadline, String annualReturnDeadline) {
        this.brackets = brackets;
        this.remittanceDeadline = remittanceDeadline;
        this.annualReturnDeadline = annualReturnDeadline;
    }

    public List<TaxBracketDto> getBrackets() { return brackets; }
    public void setBrackets(List<TaxBracketDto> brackets) { this.brackets = brackets; }

    public String getRemittanceDeadline() { return remittanceDeadline; }
    public void setRemittanceDeadline(String remittanceDeadline) { this.remittanceDeadline = remittanceDeadline; }

    public String getAnnualReturnDeadline() { return annualReturnDeadline; }
    public void setAnnualReturnDeadline(String annualReturnDeadline) { this.annualReturnDeadline = annualReturnDeadline; }
}
