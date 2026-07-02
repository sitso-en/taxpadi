package com.taxpadi.api.dto.subscription;

public class SubscriptionFeaturesDto {
    private boolean vatManagement;
    private boolean payeManagement;
    private boolean autoFiling;
    private boolean taxSavingsVault;
    private boolean advancedReports;
    private boolean invoiceGenerator;
    private boolean referralOffers;

    public SubscriptionFeaturesDto(boolean paid) {
        this.vatManagement = true;       // free for all users
        this.invoiceGenerator = true;    // free for all users
        this.advancedReports = true;     // all reports are basic/free
        this.payeManagement = paid;
        this.autoFiling = paid;
        this.taxSavingsVault = paid;
        this.referralOffers = paid;
    }

    public boolean isVatManagement() { return vatManagement; }
    public boolean isPayeManagement() { return payeManagement; }
    public boolean isAutoFiling() { return autoFiling; }
    public boolean isTaxSavingsVault() { return taxSavingsVault; }
    public boolean isAdvancedReports() { return advancedReports; }
    public boolean isInvoiceGenerator() { return invoiceGenerator; }
    public boolean isReferralOffers() { return referralOffers; }
}
