package com.taxpadi.api.service;

import com.taxpadi.api.dto.profile.*;
import com.taxpadi.api.exception.ConflictException;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.SubscriptionTier;
import com.taxpadi.api.model.TaxProfile;
import com.taxpadi.api.model.TaxpayerCategory;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.TaxProfileRepository;
import com.taxpadi.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProfileService {

    private final TaxProfileRepository taxProfileRepository;
    private final UserRepository userRepository;

    public ProfileService(TaxProfileRepository taxProfileRepository, UserRepository userRepository) {
        this.taxProfileRepository = taxProfileRepository;
        this.userRepository = userRepository;
    }

    public ProfileListResponse getProfiles(User user) {
        List<TaxProfile> profiles = taxProfileRepository.findAllByUser(user);
        List<ProfileSummaryDto> summaries = profiles.stream()
            .map(p -> new ProfileSummaryDto(
                p.getProfileId(),
                p.getLabel(),
                p.getTaxpayerCategory().name().toLowerCase(),
                p.getTin(),
                p.getProfileId().equals(user.getActiveProfileId()),
                p.getCreatedAt()
            )).toList();
        return new ProfileListResponse(summaries, summaries.size());
    }

    @Transactional
    public CreateProfileResponse createProfile(User user, CreateProfileRequest request) {
        int maxProfiles = user.getSubscriptionTier() == SubscriptionTier.FREE ? 1 : 5;
        if (taxProfileRepository.countByUser(user) >= maxProfiles) {
            throw new ConflictException("You have reached the maximum number of profiles allowed on your plan");
        }

        TaxProfile profile = new TaxProfile();
        profile.setUser(user);
        profile.setLabel(request.getLabel());
        profile.setTaxpayerCategory(TaxpayerCategory.valueOf(request.getTaxpayerCategory().toUpperCase()));
        profile.setTin(request.getTin());
        profile.setTaxYearStart(request.getTaxYearStart());
        profile.setIsPrimary(false);

        TaxProfile saved = taxProfileRepository.save(profile);

        return new CreateProfileResponse(
            saved.getProfileId(),
            saved.getLabel(),
            saved.getTaxpayerCategory().name().toLowerCase(),
            saved.getTin(),
            saved.getTaxYearStart(),
            false,
            saved.getCreatedAt()
        );
    }

    @Transactional
    public UpdateProfileResponse updateProfile(User user, UUID profileId, UpdateProfileRequest request) {
        TaxProfile profile = taxProfileRepository.findByProfileIdAndUser(profileId, user)
            .orElseThrow(() -> new NotFoundException("No profile found with this ID"));

        // TODO: block tax_year_start change if a return has been filed (check tax_returns in Group 14)
        if (request.getLabel() != null) profile.setLabel(request.getLabel());
        if (request.getTaxYearStart() != null) profile.setTaxYearStart(request.getTaxYearStart());

        TaxProfile saved = taxProfileRepository.save(profile);

        return new UpdateProfileResponse(
            saved.getProfileId(),
            saved.getLabel(),
            saved.getTaxYearStart(),
            saved.getUpdatedAt()
        );
    }

    @Transactional
    public void deleteProfile(User user, UUID profileId) {
        TaxProfile profile = taxProfileRepository.findByProfileIdAndUser(profileId, user)
            .orElseThrow(() -> new NotFoundException("No profile found with this ID"));

        if (Boolean.TRUE.equals(profile.getIsPrimary())) {
            throw new ForbiddenException("Your primary profile cannot be deleted");
        }

        // TODO: block if profile has filed tax returns (Group 14)

        if (profileId.equals(user.getActiveProfileId())) {
            TaxProfile primary = taxProfileRepository.findByUserAndIsPrimaryTrue(user)
                .orElseThrow(() -> new NotFoundException("Primary profile not found"));
            user.setActiveProfileId(primary.getProfileId());
            userRepository.save(user);
        }

        taxProfileRepository.delete(profile);
    }

    @Transactional
    public SwitchProfileResponse switchProfile(User user, UUID profileId) {
        if (profileId.equals(user.getActiveProfileId())) {
            throw new ConflictException("This profile is already the active profile");
        }

        TaxProfile profile = taxProfileRepository.findByProfileIdAndUser(profileId, user)
            .orElseThrow(() -> new NotFoundException("No profile found with this ID"));

        user.setActiveProfileId(profileId);
        userRepository.save(user);

        return new SwitchProfileResponse(
            profile.getProfileId(),
            profile.getLabel(),
            profile.getTaxpayerCategory().name().toLowerCase(),
            profile.getTin()
        );
    }
}
