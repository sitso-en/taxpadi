package com.taxpadi.api.service;

import com.taxpadi.api.dto.referral.*;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.OfferType;
import com.taxpadi.api.model.ReferralOffer;
import com.taxpadi.api.model.ReferralStatus;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.PartnerRepository;
import com.taxpadi.api.repository.ReferralOfferRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReferralService {

    private final ReferralOfferRepository referralOfferRepository;
    private final PartnerRepository partnerRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public ReferralService(ReferralOfferRepository referralOfferRepository,
                           PartnerRepository partnerRepository,
                           BCryptPasswordEncoder passwordEncoder) {
        this.referralOfferRepository = referralOfferRepository;
        this.partnerRepository = partnerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public ReferralListResponse getOffers(User user, String offerType, int page, int limit) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 20);

        Page<ReferralOffer> results;
        if (offerType != null) {
            OfferType type = OfferType.valueOf(offerType.toUpperCase());
            results = referralOfferRepository
                .findAllByUserAndOfferTypeAndStatusNotOrderByCreatedAtDesc(
                    user, type, ReferralStatus.DISMISSED, PageRequest.of(safePage, safeLimit));
        } else {
            results = referralOfferRepository
                .findAllByUserAndStatusNotOrderByCreatedAtDesc(
                    user, ReferralStatus.DISMISSED, PageRequest.of(safePage, safeLimit));
        }

        List<ReferralOfferItem> offers = results.getContent().stream()
            .filter(o -> o.getStatus() != ReferralStatus.EXPIRED)
            .map(this::toItem)
            .toList();

        return new ReferralListResponse(offers, results.getTotalElements());
    }

    public EligibilityResponse checkEligibility(User user) {
        long monthsOfData = java.time.temporal.ChronoUnit.MONTHS.between(
            user.getCreatedAt().toLocalDate().atStartOfDay(),
            LocalDateTime.now()
        );

        boolean eligible = monthsOfData >= 3;

        EligibilityBasis basis = new EligibilityBasis(
            monthsOfData,
            0.00,
            eligible ? 75 : 30,
            true
        );

        EligibilityResponse response = new EligibilityResponse();
        response.setEligible(eligible);
        response.setNewOffersGenerated(0);
        response.setEligibilityBasis(basis);
        return response;
    }

    @Transactional
    public OfferStatusResponse markViewed(User user, UUID id) {
        ReferralOffer offer = findOffer(user, id);
        if (offer.getStatus() == ReferralStatus.ACTIVE) {
            offer.setStatus(ReferralStatus.VIEWED);
            referralOfferRepository.save(offer);
        }
        return new OfferStatusResponse(offer.getOfferId(), offer.getStatus());
    }

    @Transactional
    public ClickedOfferResponse markClicked(User user, UUID id) {
        ReferralOffer offer = findOffer(user, id);
        if (offer.getExpiresAt() != null && offer.getExpiresAt().isBefore(LocalDateTime.now())) {
            offer.setStatus(ReferralStatus.EXPIRED);
            referralOfferRepository.save(offer);
            throw new BadRequestException("This offer has expired and is no longer available");
        }
        offer.setStatus(ReferralStatus.CLICKED);
        referralOfferRepository.save(offer);

        ClickedOfferResponse response = new ClickedOfferResponse();
        response.setOfferId(offer.getOfferId());
        response.setPartnerName(offer.getPartnerName());
        response.setProductName(offer.getProductName());
        response.setDeepLink(offer.getDeepLink());
        response.setStatus(offer.getStatus());
        return response;
    }

    @Transactional
    public OfferStatusResponse dismiss(User user, UUID id) {
        ReferralOffer offer = findOffer(user, id);
        offer.setStatus(ReferralStatus.DISMISSED);
        referralOfferRepository.save(offer);
        return new OfferStatusResponse(offer.getOfferId(), offer.getStatus());
    }

    @Transactional
    public ConvertedOfferResponse markConverted(UUID id, MarkConvertedRequest request, String apiKey) {
        ReferralOffer offer = referralOfferRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Offer not found"));

        partnerRepository.findByNameIgnoreCase(offer.getPartnerName())
            .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
            .filter(p -> apiKey != null && passwordEncoder.matches(apiKey, p.getApiKeyHash()))
            .orElseThrow(() -> new ForbiddenException("Invalid or missing partner API key."));
        offer.setStatus(ReferralStatus.CONVERTED);
        offer.setPartnerReference(request.getPartnerReference());
        offer.setConvertedAt(request.getConvertedAt() != null
            ? LocalDateTime.parse(request.getConvertedAt())
            : LocalDateTime.now());
        referralOfferRepository.save(offer);

        ConvertedOfferResponse response = new ConvertedOfferResponse();
        response.setOfferId(offer.getOfferId());
        response.setStatus(offer.getStatus());
        response.setPartnerReference(offer.getPartnerReference());
        response.setConvertedAt(offer.getConvertedAt());
        return response;
    }

    private ReferralOffer findOffer(User user, UUID id) {
        return referralOfferRepository.findByOfferIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Offer not found"));
    }

    private ReferralOfferItem toItem(ReferralOffer o) {
        ReferralOfferItem item = new ReferralOfferItem();
        item.setOfferId(o.getOfferId());
        item.setOfferType(o.getOfferType());
        item.setPartnerName(o.getPartnerName());
        item.setProductName(o.getProductName());
        item.setMaxAmount(o.getMaxAmount());
        item.setInterestRate(o.getInterestRate());
        item.setDescription(o.getDescription());
        item.setStatus(o.getStatus());
        item.setExpiresAt(o.getExpiresAt());
        return item;
    }
}
