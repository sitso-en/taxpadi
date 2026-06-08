package com.taxpadi.api.dto.report;

import java.math.BigDecimal;
import java.util.List;

public class ExpenseBreakdown {

    private BigDecimal total;
    private BigDecimal deductibleTotal;
    private List<CategoryTotal> byCategory;

    public ExpenseBreakdown(BigDecimal total, BigDecimal deductibleTotal, List<CategoryTotal> byCategory) {
        this.total = total;
        this.deductibleTotal = deductibleTotal;
        this.byCategory = byCategory;
    }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public BigDecimal getDeductibleTotal() { return deductibleTotal; }
    public void setDeductibleTotal(BigDecimal deductibleTotal) { this.deductibleTotal = deductibleTotal; }

    public List<CategoryTotal> getByCategory() { return byCategory; }
    public void setByCategory(List<CategoryTotal> byCategory) { this.byCategory = byCategory; }
}
