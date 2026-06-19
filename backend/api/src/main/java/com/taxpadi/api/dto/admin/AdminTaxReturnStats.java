package com.taxpadi.api.dto.admin;

public class AdminTaxReturnStats {

    private long totalFiled;
    private long filedThisMonth;

    public AdminTaxReturnStats(long totalFiled, long filedThisMonth) {
        this.totalFiled = totalFiled;
        this.filedThisMonth = filedThisMonth;
    }

    public long getTotalFiled() { return totalFiled; }
    public long getFiledThisMonth() { return filedThisMonth; }
}
