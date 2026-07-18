package com.taxpadi.api.service;

import com.taxpadi.api.dto.taxprofile.CompleteOnboardingRequest;
import com.taxpadi.api.dto.taxprofile.CompleteOnboardingResponse;
import com.taxpadi.api.dto.taxprofile.TaxProfileDto;
import com.taxpadi.api.dto.taxprofile.UpdateTaxProfileRequest;
import com.taxpadi.api.dto.taxprofile.UpdateTaxProfileResponse;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ConflictException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.UserTaxProfile;
import com.taxpadi.api.repository.UserRepository;
import com.taxpadi.api.repository.UserTaxProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class TaxProfileService {

    private final UserTaxProfileRepository profileRepository;
    private final UserRepository userRepository;

    public TaxProfileService(UserTaxProfileRepository profileRepository,
                             UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public TaxProfileDto getProfile(User user) {
        return profileRepository.findByUser(user)
                .map(this::toDto)
                .orElseGet(() -> {
                    TaxProfileDto dto = new TaxProfileDto();
                    dto.setUserId(user.getUserId());
                    dto.setFullName(user.getFullName());
                    dto.setTin(user.getTin());
                    dto.setTaxpayerType(user.getTaxpayerCategory() != null ? user.getTaxpayerCategory().name() : null);
                    dto.setRegion(user.getRegion());
                    dto.setRegistrationDate(user.getCreatedAt());
                    dto.setVatRegistered(false);
                    dto.setPayeRegistered(false);
                    dto.setNhilRegistered(false);
                    dto.setOnboardingComplete(false);
                    return dto;
                });
    }

    @Transactional
    public UpdateTaxProfileResponse updateProfile(User user, UpdateTaxProfileRequest request) {
        UserTaxProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Tax profile not found for this user"));

        if (request.getVatRegistrationNo() != null)
            profile.setVatRegistrationNo(request.getVatRegistrationNo());

        if (request.getNhilRegistered() != null)
            profile.setNhilRegistered(request.getNhilRegistered());

        if (request.getTaxYearStart() != null) {
            if (Boolean.TRUE.equals(profile.getOnboardingComplete()))
                throw new BadRequestException(
                        "tax_year_start cannot be changed after onboarding is complete");
            profile.setTaxYearStart(LocalDate.parse(request.getTaxYearStart()));
        }

        UserTaxProfile saved = profileRepository.save(profile);

        UpdateTaxProfileResponse response = new UpdateTaxProfileResponse();
        response.setProfileId(saved.getProfileId());
        response.setVatRegistrationNo(saved.getVatRegistrationNo());
        response.setNhilRegistered(saved.getNhilRegistered());
        response.setTaxYearStart(saved.getTaxYearStart());
        response.setUpdatedAt(saved.getUpdatedAt());
        return response;
    }

    @Transactional
    public CompleteOnboardingResponse completeOnboarding(User user, CompleteOnboardingRequest request) {
        UserTaxProfile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    UserTaxProfile p = new UserTaxProfile();
                    p.setUser(user);
                    return p;
                });

        if (Boolean.TRUE.equals(profile.getOnboardingComplete()))
            throw new ConflictException("Onboarding has already been completed for this account");

        if (request.getTaxYearStart() == null || request.getTaxYearStart().isBlank())
            throw new BadRequestException("tax_year_start is required");

        profile.setTaxYearStart(LocalDate.parse(request.getTaxYearStart()));
        profile.setOnboardingComplete(true);
        profileRepository.save(profile);

        boolean tinSaved = false;
        if (request.getTin() != null && !request.getTin().isBlank()) {
            user.setTin(request.getTin());
            userRepository.save(user);
            tinSaved = true;
        }

        CompleteOnboardingResponse response = new CompleteOnboardingResponse();
        response.setOnboardingComplete(true);
        response.setTaxYearStart(profile.getTaxYearStart());
        response.setDeadlinesGenerated(4);
        response.setTinSaved(tinSaved);
        return response;
    }

    private TaxProfileDto toDto(UserTaxProfile p) {
        TaxProfileDto dto = new TaxProfileDto();
        dto.setProfileId(p.getProfileId());
        User user = p.getUser();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setTin(user.getTin());
        dto.setTaxpayerType(user.getTaxpayerCategory() != null ? user.getTaxpayerCategory().name() : null);
        dto.setRegion(user.getRegion());
        dto.setRegistrationDate(user.getCreatedAt());
        dto.setVatRegistered(p.getVatRegistered());
        dto.setVatRegistrationNo(p.getVatRegistrationNo());
        dto.setPayeRegistered(p.getPayeRegistered());
        dto.setNhilRegistered(p.getNhilRegistered());
        dto.setTaxYearStart(p.getTaxYearStart());
        boolean onboardingComplete = Boolean.TRUE.equals(p.getOnboardingComplete())
                || (user.getTin() != null && !user.getTin().isBlank() && p.getTaxYearStart() != null);
        dto.setOnboardingComplete(onboardingComplete);
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}
