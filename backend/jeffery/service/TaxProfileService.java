package com.taxpadi.service;

import com.taxpadi.entity.TaxProfile;
import com.taxpadi.repository.TaxProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class TaxProfileService {

    private final TaxProfileRepository taxProfileRepository;

    public TaxProfileService(TaxProfileRepository taxProfileRepository) {
        this.taxProfileRepository = taxProfileRepository;
    }

    // GET /api/v1/tax-profile
    public Map<String, Object> getProfile(String userId) {
        TaxProfile profile = taxProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new TaxProfileNotFoundException(
                        "Tax profile not found for this user"));
        return mapToResponse(profile);
    }

    // PUT /api/v1/tax-profile
    @Transactional
    public Map<String, Object> updateProfile(String userId, Map<String, Object> request) {
        TaxProfile profile = taxProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new TaxProfileNotFoundException(
                        "Tax profile not found for this user"));

        if (request.containsKey("vat_registration_no"))
            profile.setVatRegistrationNo((String) request.get("vat_registration_no"));

        if (request.containsKey("nhil_registered"))
            profile.setNhilRegistered((Boolean) request.get("nhil_registered"));

        if (request.containsKey("tax_year_start")) {
            if (profile.isTaxYearLocked())
                throw new ValidationException(
                        "tax_year_start cannot be changed after a tax return has been filed");
            profile.setTaxYearStart(LocalDate.parse((String) request.get("tax_year_start")));
        }

        profile.setUpdatedAt(LocalDateTime.now());
        TaxProfile saved = taxProfileRepository.save(profile);

        Map<String, Object> data = new HashMap<>();
        data.put("profile_id", saved.getProfileId());
        data.put("vat_registration_no", saved.getVatRegistrationNo());
        data.put("nhil_registered", saved.isNhilRegistered());
        data.put("tax_year_start", saved.getTaxYearStart());
        data.put("updated_at", saved.getUpdatedAt());
        return data;
    }

    // POST /api/v1/tax-profile/complete-onboarding
    @Transactional
    public Map<String, Object> completeOnboarding(String userId, Map<String, Object> request) {
        TaxProfile profile = taxProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    TaxProfile p = new TaxProfile();
                    p.setUserId(userId);
                    return p;
                });

        if (profile.isOnboardingComplete())
            throw new AlreadyOnboardedException(
                    "Onboarding has already been completed for this account");

        if (!request.containsKey("tax_year_start") || request.get("tax_year_start") == null)
            throw new ValidationException("tax_year_start is required");

        profile.setTaxYearStart(LocalDate.parse((String) request.get("tax_year_start")));

        boolean tinSaved = false;
        if (request.containsKey("tin") && request.get("tin") != null
                && !((String) request.get("tin")).isBlank()) {
            profile.setTin((String) request.get("tin"));
            tinSaved = true;
        }

        profile.setOnboardingComplete(true);
        profile.setUpdatedAt(LocalDateTime.now());
        taxProfileRepository.save(profile);

        Map<String, Object> data = new HashMap<>();
        data.put("onboarding_complete", true);
        data.put("tax_year_start", profile.getTaxYearStart());
        data.put("deadlines_generated", 4);
        data.put("tin_saved", tinSaved);
        return data;
    }

    private Map<String, Object> mapToResponse(TaxProfile p) {
        Map<String, Object> data = new HashMap<>();
        data.put("profile_id", p.getProfileId());
        data.put("user_id", p.getUserId());
        data.put("vat_registered", p.isVatRegistered());
        data.put("vat_registration_no", p.getVatRegistrationNo());
        data.put("paye_registered", p.isPayeRegistered());
        data.put("nhil_registered", p.isNhilRegistered());
        data.put("tax_year_start", p.getTaxYearStart());
        data.put("onboarding_complete", p.isOnboardingComplete());
        data.put("created_at", p.getCreatedAt());
        data.put("updated_at", p.getUpdatedAt());
        return data;
    }

    public static class TaxProfileNotFoundException extends RuntimeException {
        public TaxProfileNotFoundException(String msg) { super(msg); }
    }
    public static class AlreadyOnboardedException extends RuntimeException {
        public AlreadyOnboardedException(String msg) { super(msg); }
    }
    public static class ValidationException extends RuntimeException {
        public ValidationException(String msg) { super(msg); }
    }
}