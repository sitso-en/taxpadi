package com.taxpadi.api.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EligibilityThreshold {

    private Integer minMonthsData;
    private Double minAverageIncome;
    private Integer minConsistencyScore;
    private Boolean requiresTaxCompliance;

    public Integer getMinMonthsData() { return minMonthsData; }
    public void setMinMonthsData(Integer minMonthsData) { this.minMonthsData = minMonthsData; }

    public Double getMinAverageIncome() { return minAverageIncome; }
    public void setMinAverageIncome(Double minAverageIncome) { this.minAverageIncome = minAverageIncome; }

    public Integer getMinConsistencyScore() { return minConsistencyScore; }
    public void setMinConsistencyScore(Integer minConsistencyScore) { this.minConsistencyScore = minConsistencyScore; }

    public Boolean getRequiresTaxCompliance() { return requiresTaxCompliance; }
    public void setRequiresTaxCompliance(Boolean requiresTaxCompliance) { this.requiresTaxCompliance = requiresTaxCompliance; }
}
