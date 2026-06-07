package com.taxpadi.api.dto.report;

public class RecordsIncluded {

    private long transactions;
    private long taxReturns;
    private long payments;
    private long certificates;

    public RecordsIncluded(long transactions, long taxReturns, long payments, long certificates) {
        this.transactions = transactions;
        this.taxReturns = taxReturns;
        this.payments = payments;
        this.certificates = certificates;
    }

    public long getTransactions() { return transactions; }
    public void setTransactions(long transactions) { this.transactions = transactions; }

    public long getTaxReturns() { return taxReturns; }
    public void setTaxReturns(long taxReturns) { this.taxReturns = taxReturns; }

    public long getPayments() { return payments; }
    public void setPayments(long payments) { this.payments = payments; }

    public long getCertificates() { return certificates; }
    public void setCertificates(long certificates) { this.certificates = certificates; }
}
