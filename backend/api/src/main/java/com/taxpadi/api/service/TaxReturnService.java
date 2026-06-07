package com.taxpadi.api.service;

import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.taxreturn.*;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.TaxCalculation;
import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.TaxCalculationRepository;
import com.taxpadi.api.repository.TaxDeadlineRepository;
import com.taxpadi.api.repository.TaxReturnRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TaxReturnService {

    private static final List<String> VALID_TAX_TYPES = List.of("income_tax", "vat", "paye", "withholding");

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

    public TaxReturnListResponse getReturns(User user, String taxType, String status,
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

        return new TaxReturnListResponse(
            returns,
            new PaginationInfo(results.getTotalElements(), page, safeLimit, results.getTotalPages())
        );
    }

    @Transactional
    public GenerateReturnResponse generate(User user, GenerateReturnRequest request, String ipAddress) {
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

        String taxType = request.getTaxType();
        int taxYear = request.getTaxYear();
        LocalDate periodStart;
        LocalDate periodEnd;

        if (taxType.equals("vat") || taxType.equals("paye")) {
            YearMonth ym = YearMonth.of(taxYear, request.getMonth());
            periodStart = ym.atDay(1);
            periodEnd = ym.atEndOfMonth();
        } else {
            periodStart = LocalDate.of(taxYear, 1, 1);
            periodEnd = LocalDate.of(taxYear, 12, 31);
        }

        if (taxReturnRepository.findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
                user, taxType, periodStart, periodEnd).isPresent()) {
            throw new BadRequestException("A return already exists for this tax type and period.");
        }

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

        GenerateReturnResponse response = new GenerateReturnResponse();
        response.setReturnId(taxReturn.getReturnId());
        response.setTaxType(taxReturn.getTaxType());
        response.setTaxYear(taxReturn.getTaxYear());
        response.setPeriodStart(taxReturn.getPeriodStart());
        response.setPeriodEnd(taxReturn.getPeriodEnd());
        response.setGrossIncome(taxReturn.getGrossIncome());
        response.setTotalDeductions(taxReturn.getTotalDeductions());
        response.setTaxableIncome(taxReturn.getTaxableIncome());
        response.setTaxLiability(taxReturn.getTaxLiability());
        response.setStatus("draft");
        response.setCreatedAt(taxReturn.getCreatedAt());
        return response;
    }

    public TaxReturnDetailResponse getReturn(User user, UUID returnId) {
        TaxReturn r = findForUser(user, returnId);

        TaxReturnDetailResponse response = new TaxReturnDetailResponse();
        response.setReturnId(r.getReturnId());
        response.setTaxType(r.getTaxType());
        response.setTaxYear(r.getTaxYear());
        response.setPeriodStart(r.getPeriodStart());
        response.setPeriodEnd(r.getPeriodEnd());
        response.setGrossIncome(r.getGrossIncome());
        response.setTotalDeductions(r.getTotalDeductions());
        response.setTaxableIncome(r.getTaxableIncome());
        response.setTaxLiability(r.getTaxLiability());
        response.setStatus(r.getStatus());
        response.setSubmittedAt(r.getSubmittedAt());
        response.setGraReference(r.getGraReference());
        response.setPayment(new PaymentInfo(false, "", "", ""));
        response.setCreatedAt(r.getCreatedAt());
        response.setUpdatedAt(r.getUpdatedAt());
        return response;
    }

    public PreviewResponse preview(User user, UUID returnId) {
        TaxReturn r = findForUser(user, returnId);

        if (!"draft".equals(r.getStatus())) {
            throw new BadRequestException("This return has already been submitted.");
        }

        List<PreviewWarning> warnings = new ArrayList<>();
        if (user.getTin() == null || user.getTin().isBlank()) {
            warnings.add(new PreviewWarning(
                "TIN_MISSING",
                "Your TIN is not set. You can still submit but GRA may follow up."
            ));
        }

        List<BracketBreakdownItem> bracketBreakdown = new ArrayList<>();
        if (r.getTaxType().equals("income_tax") || r.getTaxType().equals("paye")) {
            bracketBreakdown = computeBracketBreakdown(r.getTaxableIncome());
        }

        PreviewResponse response = new PreviewResponse();
        response.setReturnId(r.getReturnId());
        response.setTaxpayer(new TaxpayerInfo(
            user.getFullName(),
            user.getTin() != null ? user.getTin() : "",
            user.getPhone(),
            user.getRegion(),
            user.getTaxpayerCategory() != null ? user.getTaxpayerCategory().name().toLowerCase() : null
        ));
        response.setReturnDetails(new ReturnDetails(
            r.getTaxType(), r.getTaxYear(), r.getPeriodStart(), r.getPeriodEnd()
        ));
        response.setFinancials(new Financials(
            r.getGrossIncome(), r.getTotalDeductions(), r.getTaxableIncome(),
            r.getTaxLiability(), bracketBreakdown
        ));
        response.setWarnings(warnings);
        response.setReadyToSubmit(warnings.isEmpty());
        return response;
    }

    @Transactional
    public SubmitReturnResponse submit(User user, UUID returnId, SubmitReturnRequest request, String ipAddress) {
        TaxReturn r = findForUser(user, returnId);

        if (!"draft".equals(r.getStatus())) {
            throw new BadRequestException("Only draft returns can be submitted.");
        }

        r.setStatus("submitted");
        r.setGraReference(request != null ? request.getGraReference() : null);
        r.setSubmittedAt(request != null && request.getSubmittedAt() != null
            ? request.getSubmittedAt() : LocalDateTime.now());
        taxReturnRepository.save(r);

        taxDeadlineRepository
            .findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
                user, r.getTaxType(), r.getPeriodStart(), r.getPeriodEnd())
            .ifPresent(deadline -> {
                deadline.setCompleted(true);
                deadline.setCompletedAt(LocalDateTime.now());
                taxDeadlineRepository.save(deadline);
            });

        auditLogService.log(user, "TAX_RETURN_SUBMITTED",
            r.getTaxType() + " return submitted, GRA ref: " + r.getGraReference(), ipAddress);

        SubmitReturnResponse response = new SubmitReturnResponse();
        response.setReturnId(r.getReturnId());
        response.setTaxType(r.getTaxType());
        response.setStatus("submitted");
        response.setGraReference(r.getGraReference());
        response.setSubmittedAt(r.getSubmittedAt());
        response.setNextStep("Proceed to payment to complete your tax obligation.");
        return response;
    }

    @Transactional
    public AmendReturnResponse amend(User user, UUID returnId, AmendReturnRequest request, String ipAddress) {
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
        auditLogService.log(user, "TAX_RETURN_AMENDED",
            r.getTaxType() + " return amended: " + request.getAmendmentReason(), ipAddress);

        AmendReturnResponse response = new AmendReturnResponse();
        response.setReturnId(r.getReturnId());
        response.setTaxType(r.getTaxType());
        response.setStatus("draft");
        response.setAmendmentReason(r.getAmendmentReason());
        response.setAmendedAt(r.getAmendedAt());
        return response;
    }

    private TaxReturn findForUser(User user, UUID returnId) {
        TaxReturn r = taxReturnRepository.findByReturnIdAndUser(returnId, user)
            .orElseThrow(() -> new NotFoundException("No tax return found with this ID."));
        if (!r.getUser().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException("You do not have access to this return.");
        }
        return r;
    }

    private List<BracketBreakdownItem> computeBracketBreakdown(BigDecimal taxableIncome) {
        List<BracketBreakdownItem> breakdown = new ArrayList<>();
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

            breakdown.add(new BracketBreakdownItem(
                "GHS " + lower.toPlainString() + " - GHS " + upper.toPlainString(),
                ratePercent.toPlainString() + "%",
                tax
            ));

            lower = upper;
            remaining = remaining.subtract(taxable);
        }

        return breakdown;
    }
}
