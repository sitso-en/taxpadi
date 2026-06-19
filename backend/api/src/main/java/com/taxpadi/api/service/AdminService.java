package com.taxpadi.api.service;

import com.taxpadi.api.dto.admin.*;
import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ConflictException;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.*;
import com.taxpadi.api.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final UserTaxProfileRepository userTaxProfileRepository;
    private final TransactionRepository transactionRepository;
    private final TaxReturnRepository taxReturnRepository;
    private final ReferralOfferRepository referralOfferRepository;
    private final AuditLogRepository auditLogRepository;
    private final PartnerRepository partnerRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        UserTaxProfileRepository userTaxProfileRepository,
                        TransactionRepository transactionRepository,
                        TaxReturnRepository taxReturnRepository,
                        ReferralOfferRepository referralOfferRepository,
                        AuditLogRepository auditLogRepository,
                        PartnerRepository partnerRepository,
                        BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userTaxProfileRepository = userTaxProfileRepository;
        this.transactionRepository = transactionRepository;
        this.taxReturnRepository = taxReturnRepository;
        this.referralOfferRepository = referralOfferRepository;
        this.auditLogRepository = auditLogRepository;
        this.partnerRepository = partnerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AdminUserListResponse getUsers(SubscriptionTier subscriptionTier, TaxpayerCategory taxpayerCategory,
                                          Boolean isActive, LocalDateTime dateFrom, LocalDateTime dateTo, int page) {
        int limit = 20;
        Page<User> result = userRepository.findAllByFilters(
                subscriptionTier, taxpayerCategory, isActive, dateFrom, dateTo,
                PageRequest.of(page - 1, limit));

        List<AdminUserSummary> users = result.getContent().stream().map(u -> {
            AdminUserSummary s = new AdminUserSummary(
                    u.getUserId(), u.getFullName(), u.getPhone(), u.getEmail(),
                    u.getTaxpayerCategory() != null ? u.getTaxpayerCategory().name() : null,
                    u.getSubscriptionTier() != null ? u.getSubscriptionTier().name() : null,
                    u.isActive(), u.isVerified(), u.getCreatedAt());
            return s;
        }).toList();

        PaginationInfo pagination = new PaginationInfo(
                (int) result.getTotalElements(), page, limit, result.getTotalPages());
        return new AdminUserListResponse(users, pagination);
    }

    public AdminUserDetail getUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("No user found with this ID."));

        AdminUserDetail detail = new AdminUserDetail();
        detail.setUserId(user.getUserId());
        detail.setFullName(user.getFullName());
        detail.setPhone(user.getPhone());
        detail.setEmail(user.getEmail());
        detail.setTin(user.getTin());
        detail.setRegion(user.getRegion());
        detail.setTaxpayerCategory(user.getTaxpayerCategory() != null ? user.getTaxpayerCategory().name() : null);
        detail.setSubscriptionTier(user.getSubscriptionTier() != null ? user.getSubscriptionTier().name() : null);
        detail.setRole(user.getRole() != null ? user.getRole().name().toLowerCase() : null);
        detail.setIsActive(user.isActive());
        detail.setIsVerified(user.isVerified());
        detail.setCreatedAt(user.getCreatedAt());

        userTaxProfileRepository.findByUser(user).ifPresent(profile ->
                detail.setTaxProfile(new AdminTaxProfileInfo(
                        profile.getVatRegistered(),
                        profile.getPayeRegistered(),
                        profile.getOnboardingComplete())));

        return detail;
    }

    @Transactional
    public AdminDeactivateResponse deactivateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("No user found with this ID."));
        if (Boolean.FALSE.equals(user.isActive())) {
            throw new BadRequestException("This account is already deactivated.");
        }
        user.setActive(false);
        userRepository.save(user);
        return new AdminDeactivateResponse(user.getUserId(), false, LocalDateTime.now());
    }

    @Transactional
    public AdminActivateResponse activateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("No user found with this ID."));
        if (Boolean.TRUE.equals(user.isActive())) {
            throw new BadRequestException("This account is already active.");
        }
        user.setActive(true);
        userRepository.save(user);
        return new AdminActivateResponse(user.getUserId(), true, LocalDateTime.now());
    }

    @Transactional
    public AdminRoleResponse changeRole(UUID userId, String roleName, User adminUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("No user found with this ID."));

        Role newRole;
        try {
            newRole = Role.valueOf(roleName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role. Must be 'user' or 'admin'.");
        }

        if (user.getUserId().equals(adminUser.getUserId()) && newRole != Role.ADMIN) {
            throw new ForbiddenException("An admin cannot demote themselves.");
        }
        if (user.getRole() == newRole) {
            throw new BadRequestException("User already has this role.");
        }

        user.setRole(newRole);
        userRepository.save(user);
        return new AdminRoleResponse(user.getUserId(), newRole.name().toLowerCase(), LocalDateTime.now());
    }

    public AdminStatsResponse getStats() {
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime now = LocalDateTime.now();

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActive(true);
        long verifiedUsers = userRepository.countByIsVerified(true);
        long freeUsers = userRepository.countBySubscriptionTier(SubscriptionTier.FREE);
        long paidUsers = totalUsers - freeUsers;
        long newThisMonth = userRepository.countByCreatedAtBetween(monthStart, now);

        long totalTransactions = transactionRepository.count();
        long transactionsThisMonth = transactionRepository.countByCreatedAtBetween(monthStart, now);

        long totalTaxReturns = taxReturnRepository.count();
        long taxReturnsThisMonth = taxReturnRepository.countByCreatedAtBetween(monthStart, now);

        long totalOffersGenerated = referralOfferRepository.count();
        long totalClicked = referralOfferRepository.countByStatus(ReferralStatus.CLICKED);
        long totalConverted = referralOfferRepository.countByStatus(ReferralStatus.CONVERTED);

        AdminStatsResponse response = new AdminStatsResponse();
        response.setUsers(new AdminUserStats(totalUsers, activeUsers, verifiedUsers, freeUsers, paidUsers, newThisMonth));
        response.setTransactions(new AdminTransactionStats(totalTransactions, transactionsThisMonth));
        response.setTaxReturns(new AdminTaxReturnStats(totalTaxReturns, taxReturnsThisMonth));
        response.setPayments(new AdminPaymentStats(0, java.math.BigDecimal.ZERO, 0));
        response.setReferrals(new AdminReferralStats(totalOffersGenerated, totalClicked, totalConverted));
        return response;
    }

    public AdminAuditLogResponse getAuditLog(UUID userId, String action,
                                              LocalDateTime dateFrom, LocalDateTime dateTo, int page) {
        int limit = 50;
        Page<AuditLog> result = auditLogRepository.findAllByFilters(
                userId, action, dateFrom, dateTo,
                PageRequest.of(page - 1, limit));

        List<AdminAuditLogItem> logs = result.getContent().stream().map(log -> {
            AdminAuditLogItem item = new AdminAuditLogItem();
            item.setLogId(log.getLogId());
            item.setUserId(log.getUser() != null ? log.getUser().getUserId() : null);
            item.setUserPhone(log.getUser() != null ? log.getUser().getPhone() : null);
            item.setAction(log.getAction());
            item.setDetail(log.getDetail());
            item.setIpAddress(log.getIpAddress());
            item.setCreatedAt(log.getCreatedAt());
            return item;
        }).toList();

        PaginationInfo pagination = new PaginationInfo(
                (int) result.getTotalElements(), page, limit, result.getTotalPages());
        return new AdminAuditLogResponse(logs, pagination);
    }

    public AdminPartnersResponse getPartners() {
        List<AdminPartnerItem> items = partnerRepository.findAll().stream().map(p -> {
            AdminPartnerItem item = new AdminPartnerItem();
            item.setPartnerId(p.getPartnerId());
            item.setName(p.getName());
            item.setOfferType(p.getOfferType());
            item.setActive(Boolean.TRUE.equals(p.getIsActive()));
            item.setEligibilityThreshold(toEligibilityThreshold(p.getEligibilityThreshold()));
            item.setTotalOffersGenerated(p.getTotalOffersGenerated());
            item.setTotalConverted(p.getTotalConverted());
            item.setCreatedAt(p.getCreatedAt());
            return item;
        }).toList();
        return new AdminPartnersResponse(items);
    }

    @Transactional
    public CreatePartnerResponse createPartner(CreatePartnerRequest request) {
        partnerRepository.findByNameIgnoreCase(request.getName())
                .ifPresent(p -> { throw new ConflictException("A partner with this name already exists."); });

        String rawApiKey = generateApiKey();
        String hashedApiKey = passwordEncoder.encode(rawApiKey);

        Partner partner = new Partner();
        partner.setName(request.getName());
        partner.setOfferType(request.getOfferType());
        partner.setApiKeyHash(hashedApiKey);
        partner.setEligibilityThreshold(toEligibilityMap(request.getEligibilityThreshold()));
        partnerRepository.save(partner);

        CreatePartnerResponse response = new CreatePartnerResponse();
        response.setPartnerId(partner.getPartnerId());
        response.setName(partner.getName());
        response.setOfferType(partner.getOfferType());
        response.setApiKey(rawApiKey);
        response.setActive(Boolean.TRUE.equals(partner.getIsActive()));
        response.setCreatedAt(partner.getCreatedAt());
        return response;
    }

    @Transactional
    public UpdatePartnerResponse updatePartner(UUID partnerId, UpdatePartnerRequest request) {
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new NotFoundException("No partner found with this ID."));

        if (request.getName() != null) partner.setName(request.getName());
        if (request.getIsActive() != null) partner.setIsActive(request.getIsActive());
        if (request.getEligibilityThreshold() != null) {
            partner.setEligibilityThreshold(toEligibilityMap(request.getEligibilityThreshold()));
        }
        partnerRepository.save(partner);
        return new UpdatePartnerResponse(partner.getPartnerId(), partner.getName(),
                Boolean.TRUE.equals(partner.getIsActive()), LocalDateTime.now());
    }

    @Transactional
    public DeletePartnerResponse deletePartner(UUID partnerId) {
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new NotFoundException("No partner found with this ID."));
        if (Boolean.FALSE.equals(partner.getIsActive())) {
            throw new BadRequestException("This partner is already inactive.");
        }

        long offersExpired = referralOfferRepository.findAll().stream()
                .filter(o -> o.getStatus() == ReferralStatus.ACTIVE
                        && o.getPartnerName().equalsIgnoreCase(partner.getName()))
                .peek(o -> {
                    o.setStatus(ReferralStatus.EXPIRED);
                    referralOfferRepository.save(o);
                }).count();

        partner.setIsActive(false);
        partnerRepository.save(partner);
        return new DeletePartnerResponse(partner.getPartnerId(), false, (int) offersExpired);
    }

    private String generateApiKey() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private EligibilityThreshold toEligibilityThreshold(Map<String, Object> map) {
        if (map == null) return null;
        EligibilityThreshold et = new EligibilityThreshold();
        if (map.get("min_months_data") instanceof Number n) et.setMinMonthsData(n.intValue());
        if (map.get("min_average_income") instanceof Number n) et.setMinAverageIncome(n.doubleValue());
        if (map.get("min_consistency_score") instanceof Number n) et.setMinConsistencyScore(n.intValue());
        if (map.get("requires_tax_compliance") instanceof Boolean b) et.setRequiresTaxCompliance(b);
        return et;
    }

    private Map<String, Object> toEligibilityMap(EligibilityThreshold et) {
        if (et == null) return null;
        return Map.of(
                "min_months_data", et.getMinMonthsData(),
                "min_average_income", et.getMinAverageIncome(),
                "min_consistency_score", et.getMinConsistencyScore(),
                "requires_tax_compliance", et.getRequiresTaxCompliance()
        );
    }
}
