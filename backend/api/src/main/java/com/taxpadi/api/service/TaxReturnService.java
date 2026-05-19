package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxpadi.api.dto.taxreturn.AmendReturnRequest;
import com.taxpadi.api.dto.taxreturn.GenerateReturnRequest;
import com.taxpadi.api.dto.taxreturn.SubmitReturnRequest;
import com.taxpadi.api.dto.taxreturn.TaxReturnSummaryDto;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.TaxCalculation;
import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.TaxCalculationRepository;
import com.taxpadi.api.repository.TaxDeadlineRepository;
import com.taxpadi.api.repository.TaxReturnRepository;

@Service
public class TaxReturnService {

    private static final List<String> VALID_TAX_TYPES = List.of("income_tax", "vat", "paye", "withholding");

    // Ghana 2025 annual income tax brackets for preview breakdown
    private static final BigDecimal[][] INCOME_TAX_BRACKETS = {
        { new BigDecimal("5880"),   new BigDecimal("0.00"),  new BigDecimal("0") },
        { new BigDecimal("1320"),   new BigDecimal("0.05"),  new BigDecimal("5") },
        { new BigDecimal("1560"),   new BigDecimal("0.10"),  new BigDecimal("10") },
        { new BigDecimal("38000"),  new BigDecimal("0.175"), new BigDecimal("17.5") },
        { new BigDecimal("192000"), new BigDecimal("0.25"),  new BigDecimal("25") },
        { new BigDecimal("366240"), new BigDecimal("0.30"),  new BigDecimal("30") },
        { null,                     new BigDecimal("0.35"),  new BigDecimal("35") }
    };

    private final TaxReturnRepository taxReturnRepository;
    private final TaxCalculationRepository taxCalculationRepository;
    private final TaxDeadlineRepository taxDeadlineRepository;
    private final AuditLogService auditLogService;

    public TaxReturnService(TaxReturnRepository taxReturnRepository,
                            TaxCalculationRepository taxCalculationRepository,
                            TaxDeadlineRepository taxDeadlineRepository,
                            AuditLogService auditLogService) {
        this.taxReturnRepository = taxReturnRepository;
        this.taxCalculationRepository = taxCalculationRepository;
        this.taxDeadlineRepository = taxDeadlineRepository;
        this.auditLogService = auditLogService;
    }

    // ── List returns ─────────────────────────────────────────────────────────

    public Map<String, Object> getReturns(User user, String taxType, String status,
                                          Integer year, int page, int limit) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);
        Page<TaxReturn> results = taxReturnRepository.findAllByFilters(
            user, taxType, status, year, PageRequest.of(safePage, safeLimit)
        );

        List<TaxReturnSummaryDto> returns = results.getContent().stream()
            .map(r -> new TaxReturnSummaryDto(
                r.getReturnId(), r.getTaxType(), r.getTaxYear(),
                r.getPeriodStart(), r.getPeriodEnd(), r.getTaxLiability(),
                r.getStatus(), r.getSubmittedAt(), r.getGraReference(), r.getCreatedAt()
            )).toList();

        return Map.of(
            "returns", returns,
            "pagination", Map.of(
                "total", results.getTotalElements(),
                "page", page,
                "limit", safeLimit,
                "total_pages", results.getTotalPages()
            )
        );
    }

    // ── Generate return ──────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> generate(User user, GenerateReturnRequest request, String ipAddress) {
        if (request.getTaxType() == null || !VALID_TAX_TYPES.contains(request.getTaxType())) {
            throw new BadRequestException("tax_type must be one of: income_tax, vat, paye, withholding.");
        }
        if (request.getTaxYear() == null) {
            throw new BadRequestException("tax_year is required.");
        }
        if ((request.getTaxType().equals("vat") || request.getTaxType().equals("paye"))
                && request.getMonth() == null) {
            throw new BadRequestException("month is required for VAT and PAYE returns.");
        }

        LocalDate periodStart;
        LocalDate periodEnd;
        String taxType = request.getTaxType();
        int taxYear = request.getTaxYear();

        if (taxType.equals("vat") || taxType.equals("paye")) {
            YearMonth ym = YearMonth.of(taxYear, request.getMonth());
            periodStart = ym.atDay(1);
            periodEnd = ym.atEndOfMonth();
        } else {
            periodStart = LocalDate.of(taxYear, 1, 1);
            periodEnd = LocalDate.of(taxYear, 12, 31);
        }

        // Check for duplicate
        if (taxReturnRepository.findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
                user, taxType, periodStart, periodEnd).isPresent()) {
            throw new BadRequestException("A return already exists for this tax type and period.");
        }

        // Pull from tax_calculations
        TaxCalculation calc = taxCalculationRepository
            .findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(user, taxType, periodStart, periodEnd)
            .orElseThrow(() -> new NotFoundException("No transactions found for this period."));

        TaxReturn taxReturn = new TaxReturn();
        taxReturn.setUser(user);
        taxReturn.setCalculationId(calc.getCalculationId());
        taxReturn.setTaxType(taxType);
        taxReturn.setTaxYear(taxYear);
        taxReturn.setPeriodStart(periodStart);
        taxReturn.setPeriodEnd(periodEnd);
        taxReturn.setGrossIncome(calc.getGrossIncome());
        taxReturn.setTotalDeductions(calc.getTotalDeductions());
        taxReturn.setTaxableIncome(calc.getTaxableIncome());
        taxReturn.setTaxLiability(calc.getTaxLiability());
        taxReturn.setStatus("draft");
        taxReturnRepository.save(taxReturn);
        auditLogService.log(user, "TAX_RETURN_GENERATED", taxType + " return generated for " + taxYear, ipAddress);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("return_id", taxReturn.getReturnId());
        result.put("tax_type", taxReturn.getTaxType());
        result.put("tax_year", taxReturn.getTaxYear());
        result.put("period_start", taxReturn.getPeriodStart());
        result.put("period_end", taxReturn.getPeriodEnd());
        result.put("gross_income", taxReturn.getGrossIncome());
        result.put("total_deductions", taxReturn.getTotalDeductions());
        result.put("taxable_income", taxReturn.getTaxableIncome());
        result.put("tax_liability", taxReturn.getTaxLiability());
        result.put("status", "draft");
        result.put("created_at", taxReturn.getCreatedAt());
        return result;
    }

    // ── Get single return ────────────────────────────────────────────────────

    public Map<String, Object> getReturn(User user, UUID returnId) {
        TaxReturn r = findForUser(user, returnId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("return_id", r.getReturnId());
        result.put("tax_type", r.getTaxType());
        result.put("tax_year", r.getTaxYear());
        result.put("period_start", r.getPeriodStart());
        result.put("period_end", r.getPeriodEnd());
        result.put("gross_income", r.getGrossIncome());
        result.put("total_deductions", r.getTotalDeductions());
        result.put("taxable_income", r.getTaxableIncome());
        result.put("tax_liability", r.getTaxLiability());
        result.put("status", r.getStatus());
        result.put("submitted_at", r.getSubmittedAt());
        result.put("gra_reference", r.getGraReference());
        result.put("payment", Map.of("paid", false, "payment_id", "", "amount_paid", "", "paid_at", ""));
        result.put("created_at", r.getCreatedAt());
        result.put("updated_at", r.getUpdatedAt());
        return result;
    }

    // ── Preview ──────────────────────────────────────────────────────────────

    public Map<String, Object> preview(User user, UUID returnId) {
        TaxReturn r = findForUser(user, returnId);

        if (!"draft".equals(r.getStatus())) {
            throw new BadRequestException("This return has already been submitted.");
        }

        List<Map<String, Object>> warnings = new ArrayList<>();
        if (user.getTin() == null || user.getTin().isBlank()) {
            warnings.add(Map.of(
                "code", "TIN_MISSING",
                "message", "Your TIN is not set. You can still submit but GRA may follow up."
            ));
        }

        List<Map<String, Object>> bracketBreakdown = new ArrayList<>();
        if (r.getTaxType().equals("income_tax") || r.getTaxType().equals("paye")) {
            bracketBreakdown = computeBracketBreakdown(r.getTaxableIncome());
        }

        return Map.of(
            "return_id", r.getReturnId(),
            "taxpayer", Map.of(
                "full_name", user.getFullName(),
                "tin", user.getTin() != null ? user.getTin() : "",
                "phone", user.getPhone(),
                "region", user.getRegion(),
                "taxpayer_category", user.getTaxpayerCategory()
            ),
            "return_details", Map.of(
                "tax_type", r.getTaxType(),
                "tax_year", r.getTaxYear(),
                "period_start", r.getPeriodStart(),
                "period_end", r.getPeriodEnd()
            ),
            "financials", Map.of(
                "gross_income", r.getGrossIncome(),
                "total_deductions", r.getTotalDeductions(),
                "taxable_income", r.getTaxableIncome(),
                "tax_liability", r.getTaxLiability(),
                "bracket_breakdown", bracketBreakdown
            ),
            "warnings", warnings,
            "ready_to_submit", warnings.isEmpty()
        );
    }

    // ── Submit ───────────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> submit(User user, UUID returnId, SubmitReturnRequest request, String ipAddress) {
        TaxReturn r = findForUser(user, returnId);

        if (!"draft".equals(r.getStatus())) {
            throw new BadRequestException("Only draft returns can be submitted.");
        }

        r.setStatus("submitted");
        r.setGraReference(request != null ? request.getGraReference() : null);
        r.setSubmittedAt(request != null && request.getSubmittedAt() != null
            ? request.getSubmittedAt() : LocalDateTime.now());
        taxReturnRepository.save(r);

        // Mark matching deadline as completed
        taxDeadlineRepository
            .findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
                user, r.getTaxType(), r.getPeriodStart(), r.getPeriodEnd())
            .ifPresent(deadline -> {
                deadline.setCompleted(true);
                deadline.setCompletedAt(LocalDateTime.now());
                taxDeadlineRepository.save(deadline);
            });

        auditLogService.log(user, "TAX_RETURN_SUBMITTED", r.getTaxType() + " return submitted, GRA ref: " + r.getGraReference(), ipAddress);

        return Map.of(
            "return_id", r.getReturnId(),
            "tax_type", r.getTaxType(),
            "status", "submitted",
            "gra_reference", r.getGraReference() != null ? r.getGraReference() : "",
            "submitted_at", r.getSubmittedAt(),
            "next_step", "Proceed to payment to complete your tax obligation."
        );
    }

    // ── Amend ────────────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> amend(User user, UUID returnId, AmendReturnRequest request, String ipAddress) {
        TaxReturn r = findForUser(user, returnId);

        if (!"rejected".equals(r.getStatus())) {
            throw new BadRequestException("Only rejected returns can be amended.");
        }
        if (request.getAmendmentReason() == null || request.getAmendmentReason().isBlank()) {
            throw new BadRequestException("Amendment reason is required.");
        }

        r.setStatus("draft");
        r.setAmendmentReason(request.getAmendmentReason());
        r.setAmendedAt(LocalDateTime.now());
        taxReturnRepository.save(r);
        auditLogService.log(user, "TAX_RETURN_AMENDED", r.getTaxType() + " return amended: " + request.getAmendmentReason(), ipAddress);

        return Map.of(
            "return_id", r.getReturnId(),
            "tax_type", r.getTaxType(),
            "status", "draft",
            "amendment_reason", r.getAmendmentReason(),
            "amended_at", r.getAmendedAt()
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private TaxReturn findForUser(User user, UUID returnId) {
        TaxReturn r = taxReturnRepository.findByReturnIdAndUser(returnId, user)
            .orElseThrow(() -> new NotFoundException("No tax return found with this ID."));
        if (!r.getUser().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException("You do not have access to this return.");
        }
        return r;
    }

    private List<Map<String, Object>> computeBracketBreakdown(BigDecimal taxableIncome) {
        List<Map<String, Object>> breakdown = new ArrayList<>();
        if (taxableIncome == null || taxableIncome.compareTo(BigDecimal.ZERO) <= 0) return breakdown;

        BigDecimal remaining = taxableIncome;
        BigDecimal lower = BigDecimal.ZERO;

        for (BigDecimal[] bracket : INCOME_TAX_BRACKETS) {
            BigDecimal bandSize = bracket[0];
            BigDecimal rate = bracket[1];
            BigDecimal ratePercent = bracket[2];

            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal taxable = bandSize != null ? remaining.min(bandSize) : remaining;
            BigDecimal tax = taxable.multiply(rate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal upper = lower.add(taxable);

            breakdown.add(Map.of(
                "bracket", "GHS " + lower.toPlainString() + " - GHS " + upper.toPlainString(),
                "rate", ratePercent.toPlainString() + "%",
                "tax", tax
            ));

            lower = upper;
            remaining = remaining.subtract(taxable);
        }

        return breakdown;
    }
}
