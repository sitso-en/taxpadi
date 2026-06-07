package com.taxpadi.api.dto.notification;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationPreferences {

    private Boolean deadlineReminders;
    private Boolean penaltyAlerts;
    private Boolean vaultSuggestions;
    private Boolean referralOffers;
    private Boolean paymentConfirmations;
    private Boolean systemUpdates;

    public Boolean getDeadlineReminders() { return deadlineReminders; }
    public void setDeadlineReminders(Boolean deadlineReminders) { this.deadlineReminders = deadlineReminders; }

    public Boolean getPenaltyAlerts() { return penaltyAlerts; }
    public void setPenaltyAlerts(Boolean penaltyAlerts) { this.penaltyAlerts = penaltyAlerts; }

    public Boolean getVaultSuggestions() { return vaultSuggestions; }
    public void setVaultSuggestions(Boolean vaultSuggestions) { this.vaultSuggestions = vaultSuggestions; }

    public Boolean getReferralOffers() { return referralOffers; }
    public void setReferralOffers(Boolean referralOffers) { this.referralOffers = referralOffers; }

    public Boolean getPaymentConfirmations() { return paymentConfirmations; }
    public void setPaymentConfirmations(Boolean paymentConfirmations) { this.paymentConfirmations = paymentConfirmations; }

    public Boolean getSystemUpdates() { return systemUpdates; }
    public void setSystemUpdates(Boolean systemUpdates) { this.systemUpdates = systemUpdates; }
}
