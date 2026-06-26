package com.taxpadi.api.dto.report;

import java.util.List;

public class YearHistoryEntry {

    private int year;
    private List<TaxTypeEntry> taxTypes;
    private boolean overallCompliant;

    public YearHistoryEntry(int year, List<TaxTypeEntry> taxTypes, boolean overallCompliant) {
        this.year = year;
        this.taxTypes = taxTypes;
        this.overallCompliant = overallCompliant;
    }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public List<TaxTypeEntry> getTaxTypes() { return taxTypes; }
    public void setTaxTypes(List<TaxTypeEntry> taxTypes) { this.taxTypes = taxTypes; }

    public boolean isOverallCompliant() { return overallCompliant; }
    public void setOverallCompliant(boolean overallCompliant) { this.overallCompliant = overallCompliant; }
}
