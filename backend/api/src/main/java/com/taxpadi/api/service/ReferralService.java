package com.taxpadi.api.service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.OfferType;
import com.taxpadi.api.model.ReferralOffer;
import com.taxpadi.api.model.ReferralStatus;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.ReferralOfferRepository;

@Service
public class ReferralService {

    private final ReferralOfferRepository referralOfferRepository;

    public ReferralService(ReferralOfferRepository referralOfferRepository) {
        this.referralOfferRepository = referralOfferRepository;
    }

    public Map<String, Object> getOffers(User user, String offerType, int page, int limit) {
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

        List<Map<String, Object>> offers = results.getContent().stream()
            .filter(o -> o.getStatus() != ReferralStatus.EXPIRED)
            .map(this::toSummary)
            .toList();

        return Map.of(
            "offers", offers,
            "total", results.getTotalElements()
        );
    }

    public Map<String, Object> checkEligibility(User user) {
        long monthsOfData = java.time.temporal.ChronoUnit.MONTHS.between(
            user.getCreatedAt().toLocalDate().atStartOfDay(),
            LocalDateTime.now()
        );

        boolean eligible = monthsOfData >= 3;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("eligible", eligible);
        result.put("new_offers_generated", 0);
        result.put("eligibility_basis", Map.of(
            "months_of_data", monthsOfData,
            "average_monthly_income", 0.00,
            "income_consistency_score", eligible ? 75 : 30,
            "tax_compliance", true
        ));
        return result;
    }

    @Transactional
    public Map<String, Object> markViewed(User user, UUID id) {
        ReferralOffer offer = findOffer(user, id);
        if (offer.getStatus() == ReferralStatus.ACTIVE) {
            offer.setStatus(ReferralStatus.VIEWED);
            referralOfferRepository.save(offer);
        }
        return Map.of("offer_id", offer.getOfferId(), "status", offer.getStatus());
    }

    @Transactional
    public Map<String, Object> markClicked(User user, UUID id) {
        ReferralOffer offer = findOffer(user, id);
        if (offer.getExpiresAt() != null && offer.getExpiresAt().isBefore(LocalDateTime.now())) {
            offer.setStatus(ReferralStatus.EXPIRED);
            referralOfferRepository.save(offer);
            throw new BadRequestException("This offer has expired and is no longer available");
        }
        offer.setStatus(ReferralStatus.CLICKED);
        referralOfferRepository.save(offer);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("offer_id", offer.getOfferId());
        result.put("partner_name", offer.getPartnerName());
        result.put("product_name", offer.getProductName());
        result.put("deep_link", offer.getDeepLink());
        result.put("status", offer.getStatus());
        return result;
    }

    @Transactional
    public Map<String, Object> dismiss(User user, UUID id) {
        ReferralOffer offer = findOffer(user, id);
        offer.setStatus(ReferralStatus.DISMISSED);
        referralOfferRepository.save(offer);
        return Map.of("offer_id", offer.getOfferId(), "status", offer.getStatus());
    }

    @Transactional
    public Map<String, Object> markConverted(UUID id, Map<String, Object> body) {
        ReferralOffer offer = referralOfferRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Offer not found"));
        offer.setStatus(ReferralStatus.CONVERTED);
        offer.setPartnerReference((String) body.get("partner_reference"));
        offer.setConvertedAt(body.get("converted_at") != null
            ? LocalDateTime.parse((String) body.get("converted_at"))
            : LocalDateTime.now());
        referralOfferRepository.save(offer);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("offer_id", offer.getOfferId());
        result.put("status", offer.getStatus());
        result.put("partner_reference", offer.getPartnerReference());
        result.put("converted_at", offer.getConvertedAt());
        return result;
    }

    private ReferralOffer findOffer(User user, UUID id) {
        return referralOfferRepository.findByOfferIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Offer not found"));
    }

    private Map<String, Object> toSummary(ReferralOffer o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("offer_id", o.getOfferId());
        m.put("offer_type", o.getOfferType());
        m.put("partner_name", o.getPartnerName());
        m.put("product_name", o.getProductName());
        m.put("max_amount", o.getMaxAmount());
        m.put("interest_rate", o.getInterestRate());
        m.put("description", o.getDescription());
        m.put("status", o.getStatus());
        m.put("expires_at", o.getExpiresAt());
        return m;
    }
}
