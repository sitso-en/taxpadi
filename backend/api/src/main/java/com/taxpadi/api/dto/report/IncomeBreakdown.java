package com.taxpadi.api.dto.report;

import java.math.BigDecimal;
import java.util.List;

public class IncomeBreakdown {

    private BigDecimal total;
    private List<CategoryTotal> byCategory;

    public IncomeBreakdown(BigDecimal total, List<CategoryTotal> byCategory) {
        this.total = total;
        this.byCategory = byCategory;
    }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public List<CategoryTotal> getByCategory() { return byCategory; }
    public void setByCategory(List<CategoryTotal> byCategory) { this.byCategory = byCategory; }
}
