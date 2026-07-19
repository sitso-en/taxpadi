package com.taxpadi.api.dto.tax;

import java.util.List;

public class IncomeTaxRateInfo {

    private List<TaxBracketDto> brackets;
    private String filingDeadline;

    public IncomeTaxRateInfo() {}

    public IncomeTaxRateInfo(List<TaxBracketDto> brackets, String filingDeadline) {
        this.brackets = brackets;
        this.filingDeadline = filingDeadline;
    }

    public List<TaxBracketDto> getBrackets() { return brackets; }
    public void setBrackets(List<TaxBracketDto> brackets) { this.brackets = brackets; }

    public String getFilingDeadline() { return filingDeadline; }
    public void setFilingDeadline(String filingDeadline) { this.filingDeadline = filingDeadline; }
}
