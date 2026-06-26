package com.taxpadi.api.dto.admin;

public class AdminStatsResponse {

    private AdminUserStats users;
    private AdminTransactionStats transactions;
    private AdminTaxReturnStats taxReturns;
    private AdminPaymentStats payments;
    private AdminReferralStats referrals;

    public AdminUserStats getUsers() { return users; }
    public void setUsers(AdminUserStats users) { this.users = users; }

    public AdminTransactionStats getTransactions() { return transactions; }
    public void setTransactions(AdminTransactionStats transactions) { this.transactions = transactions; }

    public AdminTaxReturnStats getTaxReturns() { return taxReturns; }
    public void setTaxReturns(AdminTaxReturnStats taxReturns) { this.taxReturns = taxReturns; }

    public AdminPaymentStats getPayments() { return payments; }
    public void setPayments(AdminPaymentStats payments) { this.payments = payments; }

    public AdminReferralStats getReferrals() { return referrals; }
    public void setReferrals(AdminReferralStats referrals) { this.referrals = referrals; }
}
