package com.taxpadi.api.dto.auth;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserSummary {
        
        @JsonProperty("user_id")
        private UUID userId;

        @JsonProperty("full_name")
        private String fullName;

        private String phone;

        @JsonProperty("subscription_tier")
        private String subscriptionTier;

        @JsonProperty("onboarding_complete")
        private Boolean onboardingComplete;

        public UserSummary(UUID userId, String fullName, String phone, String subscriptionTier, Boolean onboardingComplete) {
            this.userId = userId;
            this.fullName = fullName;
            this.phone = phone;
            this.subscriptionTier = subscriptionTier;
            this.onboardingComplete = onboardingComplete;
        }

        // --- Getters and Setters for UserSummary ---
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getSubscriptionTier() { return subscriptionTier; }
        public void setSubscriptionTier(String subscriptionTier) { this.subscriptionTier = subscriptionTier; }

        public Boolean getOnboardingComplete() { return onboardingComplete; }
        public void setOnboardingComplete(Boolean onboardingComplete) { this.onboardingComplete = onboardingComplete; }
    }
