package com.taxpadi.api.service;

import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.penalty.*;
import com.taxpadi.api.constant.PenaltyStatus;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.constant.PenaltyStatus;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.constant.PenaltyStatus;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.Penalty;
import com.taxpadi.api.model.TaxDeadline;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.PenaltyRepository;
import com.taxpadi.api.repository.TaxDeadlineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PenaltyService {

    // GRA penalty rates
    private static final BigDecimal INCOME_TAX_BASE = new BigDecimal("200.00");
    private static final BigDecimal INCOME_TAX_DAILY_RATE = new BigDecimal("20.00");
    private static final BigDecimal INTEREST_RATE = new BigDecimal("0.075"); // 7.5% per month

    private final PenaltyRepository repo;
    private final TaxDeadlineRepository deadlineRepo;

    public PenaltyService(PenaltyRepository repo, TaxDeadlineRepository deadlineRepo) {
        this.repo = repo;
        this.deadlineRepo = deadlineRepo;
    }

    public PenaltyListResponse getPenalties(User user, int page, int limit) {
        List<Penalty> all = repo.findByUser(user);
        long total = all.size();
        int fromIdx = Math.min((page - 1) * limit, (int) total);
        int toIdx = Math.min(fromIdx + limit, (int) total);
        List<PenaltyDto> dtos = all.subList(fromIdx, toIdx).stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        BigDecimal totalOutstanding = all.stream()
                .filter(p -> "OUTSTANDING".equals(p.getStatus()))
                .map(Penalty::getPenaltyAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalResolved = all.stream()
                .filter(p -> PenaltyStatus.PAID.equals(p.getStatus()))
                .map(Penalty::getPenaltyAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long activeCount = all.stream().filter(p -> "OUTSTANDING".equals(p.getStatus())).count();

        PenaltySummary summary = new PenaltySummary(activeCount, totalOutstanding, totalResolved);
        int totalPages = (int) Math.ceil((double) total / limit);
        return new PenaltyListResponse(dtos, summary, new PaginationInfo(total, page, limit, totalPages));
    }

    public PenaltyDetailDto getPenalty(UUID penaltyId, User user) {
        Penalty p = repo.findById(penaltyId)
                .orElseThrow(() -> new NotFoundException("No penalty found with this ID."));
        if (!p.getUser().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException("You do not have access to this penalty.");
        }
        return toDetailDto(p);
    }

    private static final List<String> VALID_TAX_TYPES = List.of("income-tax", "vat", "paye", "withholding");

    public PenaltyPreviewDto preview(String taxType, User user) {
        if (!VALID_TAX_TYPES.contains(taxType.toLowerCase())) {
            throw new BadRequestException("Invalid tax type. Must be one of: " + String.join(", ", VALID_TAX_TYPES));
        }
        LocalDate deadline = resolveDeadline(taxType);
        LocalDate today = LocalDate.now();
        int daysLate = (int) Math.max(0, ChronoUnit.DAYS.between(deadline, today));
        boolean active = daysLate > 0;

        BigDecimal basePenalty = active ? INCOME_TAX_BASE : BigDecimal.ZERO;
        BigDecimal dailyPenalty = active ? INCOME_TAX_DAILY_RATE.multiply(BigDecimal.valueOf(daysLate)) : BigDecimal.ZERO;
        BigDecimal interestAmount = active
                ? basePenalty.multiply(INTEREST_RATE).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal total = basePenalty.add(dailyPenalty).add(interestAmount);

        UUID existingId = repo.findByUserAndStatus(user, "OUTSTANDING").stream()
                .filter(pen -> taxType.equals(pen.getTaxType()))
                .map(Penalty::getPenaltyId)
                .findFirst().orElse(null);

        PenaltyPreviewDto dto = new PenaltyPreviewDto();
        dto.setTaxType(taxType);
        dto.setDeadlineDate(deadline);
        dto.setDaysLate(daysLate);
        dto.setBasePenalty(basePenalty);
        dto.setDailyPenalty(dailyPenalty);
        dto.setInterestAmount(interestAmount);
        dto.setTotalPenalty(total);
        dto.setPenaltyActive(active);
        dto.setExistingPenaltyId(existingId);
        return dto;
    }

    @Transactional
    public ResolvePenaltyResponse resolve(UUID penaltyId, User user, ResolvePenaltyRequest request) {
        Penalty p = repo.findById(penaltyId)
                .orElseThrow(() -> new NotFoundException("No penalty found with this ID."));
        if (!p.getUser().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException("You do not have access to this penalty.");
        }
        if (PenaltyStatus.PAID.equals(p.getStatus())) {
            throw new BadRequestException("This penalty has already been resolved.");
        }
        LocalDateTime resolvedAt = request.getResolvedAt() != null ? request.getResolvedAt() : LocalDateTime.now();
        p.setStatus(PenaltyStatus.PAID);
        p.setPaidAt(resolvedAt);
        repo.save(p);

        ResolvePenaltyResponse resp = new ResolvePenaltyResponse();
        resp.setPenaltyId(p.getPenaltyId());
        resp.setTaxType(p.getTaxType());
        resp.setTotalPenalty(p.getPenaltyAmount());
        resp.setResolved(true);
        resp.setResolvedAt(resolvedAt);
        return resp;
    }

    private LocalDate resolveDeadline(String taxType) {
        String normalized = taxType.replace("-", "_").toLowerCase();
        List<TaxDeadline> deadlines = deadlineRepo.findByIsActiveTrue();
        return deadlines.stream()
                .filter(d -> normalized.equalsIgnoreCase(d.getTaxType().replace("-", "_")))
                .map(TaxDeadline::getDueDate)
                .min(LocalDate::compareTo)
                .orElseGet(() -> computeDefaultDeadline(normalized));
    }

    private LocalDate computeDefaultDeadline(String taxType) {
        LocalDate today = LocalDate.now();
        return switch (taxType.toLowerCase()) {
            case "vat", "paye" -> today.withDayOfMonth(1).minusDays(1);
            case "income_tax", "income-tax" -> LocalDate.of(today.getYear(), 4, 30);
            default -> today.minusDays(1);
        };
    }

    private PenaltyDto toDto(Penalty p) {
        PenaltyDto dto = new PenaltyDto();
        dto.setPenaltyId(p.getPenaltyId());
        dto.setTaxType(p.getTaxType());
        dto.setDeadlineDate(p.getDueDate());
        dto.setFilingDate(p.getFilingDate());
        dto.setDaysLate(p.getDaysLate());
        dto.setTotalPenalty(p.getPenaltyAmount());
        dto.setResolved(PenaltyStatus.PAID.equals(p.getStatus()));
        dto.setResolvedAt(p.getPaidAt());
        return dto;
    }

    private PenaltyDetailDto toDetailDto(Penalty p) {
        PenaltyDetailDto dto = new PenaltyDetailDto();
        dto.setPenaltyId(p.getPenaltyId());
        dto.setTaxType(p.getTaxType());
        dto.setDeadlineDate(p.getDueDate());
        dto.setFilingDate(p.getFilingDate());
        dto.setDaysLate(p.getDaysLate());
        dto.setTotalPenalty(p.getPenaltyAmount());
        dto.setDailyRate(INCOME_TAX_DAILY_RATE);
        dto.setPenaltyGrowsByDaily(INCOME_TAX_DAILY_RATE);
        dto.setResolved(PenaltyStatus.PAID.equals(p.getStatus()));
        dto.setResolvedAt(p.getPaidAt());

        String msg = "You are " + p.getDaysLate() + " days late. Your penalty is growing by GHS "
                + INCOME_TAX_DAILY_RATE + " every day. Filing today will stop the penalty from growing.";
        List<String> steps = List.of(
                "Generate your " + p.getTaxType().replace("_", " ") + " return",
                "Review and submit on the GRA Taxpayers Portal",
                "Pay your tax liability and penalty through TaxPadi",
                "Mark the penalty as resolved"
        );
        dto.setGuidance(new PenaltyGuidance(msg, steps));
        return dto;
    }
}
