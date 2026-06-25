package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxpadi.api.constant.TaxReturnStatus;
import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.taxreturn.AmendReturnRequest;
import com.taxpadi.api.dto.taxreturn.AmendReturnResponse;
import com.taxpadi.api.dto.taxreturn.BracketBreakdownItem;
import com.taxpadi.api.dto.taxreturn.Financials;
import com.taxpadi.api.dto.taxreturn.GenerateReturnRequest;
import com.taxpadi.api.dto.taxreturn.GenerateReturnResponse;
import com.taxpadi.api.dto.taxreturn.PaymentInfo;
import com.taxpadi.api.dto.taxreturn.PreviewResponse;
import com.taxpadi.api.dto.taxreturn.PreviewWarning;
import com.taxpadi.api.dto.taxreturn.ReturnDetails;
import com.taxpadi.api.dto.taxreturn.SubmitReturnRequest;
import com.taxpadi.api.dto.taxreturn.SubmitReturnResponse;
import com.taxpadi.api.dto.taxreturn.TaxReturnDetailResponse;
import com.taxpadi.api.dto.taxreturn.TaxReturnListResponse;
import com.taxpadi.api.dto.taxreturn.TaxReturnSummaryDto;
import com.taxpadi.api.dto.taxreturn.TaxpayerInfo;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.PayeRecord;
import com.taxpadi.api.model.TaxCalculation;
import com.taxpadi.api.model.TaxDeadline;
import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.VatRecord;
import com.taxpadi.api.repository.PayeRecordRepository;
import com.taxpadi.api.repository.TaxCalculationRepository;
import com.taxpadi.api.repository.TaxDeadlineRepository;
import com.taxpadi.api.repository.TaxReturnRepository;
import com.taxpadi.api.repository.TransactionRepository;
import com.taxpadi.api.repository.VatRecordRepository;

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
    private final VatRecordRepository vatRecordRepository;
    private final PayeRecordRepository payeRecordRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLogService auditLogService;

    public TaxReturnService(TaxReturnRepository taxReturnRepository,
                            TaxCalculationRepository taxCalculationRepository,
                            TaxDeadlineRepository taxDeadlineRepository,
                            VatRecordRepository vatRecordRepository,
                            PayeRecordRepository payeRecordRepository,
                            TransactionRepository transactionRepository,
                            AuditLogService auditLogService) {
        this.taxReturnRepository = taxReturnRepository;
        this.taxCalculationRepository = taxCalculationRepository;
        this.taxDeadlineRepository = taxDeadlineRepository;
        this.vatRecordRepository = vatRecordRepository;
        this.payeRecordRepository = payeRecordRepository;
        this.transactionRepository = transactionRepository;
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

        BigDecimal grossIncome;
        BigDecimal totalDeductions;
        BigDecimal taxableIncome;
        BigDecimal taxLiability;
        UUID calculationId = null;

        if ("vat".equals(taxType)) {
            VatRecord vat = vatRecordRepository
                .findByUserAndMonthAndYear(user, request.getMonth(), taxYear)
                .orElseThrow(() -> new NotFoundException("No VAT record found for this period. Record your VAT figures first."));
            grossIncome = vat.getTotalSales();
            totalDeductions = vat.getTotalPurchases();
            taxableIncome = vat.getTotalSales().subtract(vat.getTotalPurchases()).max(BigDecimal.ZERO);
            taxLiability = vat.getNetVatLiability();
        } else if ("paye".equals(taxType)) {
            List<PayeRecord> payeRecords = payeRecordRepository
                .findAllByUserAndMonthAndYear(user, request.getMonth(), taxYear);
            if (payeRecords.isEmpty()) {
                throw new NotFoundException("No PAYE records found for this period. Process payroll first.");
            }
            grossIncome = payeRecords.stream()
                .map(PayeRecord::getGrossSalary).reduce(BigDecimal.ZERO, BigDecimal::add);
            taxableIncome = payeRecords.stream()
                .map(PayeRecord::getTaxableSalary).reduce(BigDecimal.ZERO, BigDecimal::add);
            totalDeductions = grossIncome.subtract(taxableIncome);
            taxLiability = payeRecords.stream()
                .map(PayeRecord::getPayeDeducted).reduce(BigDecimal.ZERO, BigDecimal::add);
        } else if ("withholding".equals(taxType)) {
            BigDecimal whtIncome = java.util.Optional.ofNullable(
                transactionRepository.sumAmountByUserAndTypeAndDateRange(user, "income", periodStart, periodEnd))
                .orElse(BigDecimal.ZERO);
            BigDecimal whtLiability = java.util.Optional.ofNullable(
                transactionRepository.sumWithholdingByUserAndDateRange(user, periodStart, periodEnd))
                .orElse(BigDecimal.ZERO);
            if (whtLiability.compareTo(BigDecimal.ZERO) == 0) {
                throw new NotFoundException("No withholding tax transactions found for this period.");
            }
            grossIncome = whtIncome;
            totalDeductions = BigDecimal.ZERO;
            taxableIncome = whtIncome;
            taxLiability = whtLiability;
        } else {
            TaxCalculation calc = taxCalculationRepository
                .findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(user, taxType, periodStart, periodEnd)
                .orElseThrow(() -> new NotFoundException("No tax calculation found for this period. Ensure you have transactions recorded."));
            grossIncome = calc.getGrossIncome();
            totalDeductions = calc.getTotalDeductions();
            taxableIncome = calc.getTaxableIncome();
            taxLiability = calc.getTaxLiability();
            calculationId = calc.getCalculationId();
        }

        TaxReturn taxReturn = new TaxReturn();
        taxReturn.setUser(user);
        taxReturn.setCalculationId(calculationId);
        taxReturn.setTaxType(taxType);
        taxReturn.setTaxYear(taxYear);
        taxReturn.setPeriodStart(periodStart);
        taxReturn.setPeriodEnd(periodEnd);
        taxReturn.setGrossIncome(grossIncome);
        taxReturn.setTotalDeductions(totalDeductions);
        taxReturn.setTaxableIncome(taxableIncome);
        taxReturn.setTaxLiability(taxLiability);
        taxReturn.setStatus(TaxReturnStatus.DRAFT);
        taxReturnRepository.save(taxReturn);

        // Auto-create a deadline for this return if one doesn't exist yet
        boolean deadlineExists = taxDeadlineRepository
            .findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(user, taxType, periodStart, periodEnd)
            .isPresent();
        if (!deadlineExists) {
            LocalDate dueDate = computeDueDate(taxType, periodEnd, taxYear);
            TaxDeadline deadline = new TaxDeadline();
            deadline.setUser(user);
            deadline.setTaxType(taxType);
            deadline.setTitle(toTitle(taxType) + " Return — " + taxYear);
            deadline.setDescription("File and pay your " + toTitle(taxType) + " return for the period " + periodStart + " to " + periodEnd);
            deadline.setDueDate(dueDate);
            deadline.setFrequency("vat".equals(taxType) || "paye".equals(taxType) ? "monthly" : "annual");
            deadline.setStatus("PENDING");
            deadline.setApplicableTo("all");
            deadline.setPenaltyDescription("Late filing attracts GRA penalties and daily interest charges");
            deadline.setPeriodStart(periodStart);
            deadline.setPeriodEnd(periodEnd);
            deadline.setActive(true);
            taxDeadlineRepository.save(deadline);
        }

        auditLogService.log(user, "TAX_RETURN_GENERATED", taxType + " return generated for " + taxYear, ipAddress);

        GenerateReturnResponse response = new GenerateReturnResponse();
        response.setReturnId(taxReturn.getReturnId());
        response.setTaxType(taxReturn.getTaxType());
        response.setTaxYear(taxReturn.getTaxYear());
        response.setPeriodStart(taxReturn.getPeriodStart());
        response.setPeriodEnd(taxReturn.getPeriodEnd());
        response.setGrossIncome(grossIncome);
        response.setTotalDeductions(totalDeductions);
        response.setTaxableIncome(taxableIncome);
        response.setTaxLiability(taxLiability);
        response.setStatus(TaxReturnStatus.DRAFT);
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

        if (!TaxReturnStatus.DRAFT.equals(r.getStatus())) {
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

        if (!TaxReturnStatus.DRAFT.equals(r.getStatus())) {
            throw new BadRequestException("Only draft returns can be submitted.");
        }

        r.setStatus(TaxReturnStatus.SUBMITTED);
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
        response.setStatus(TaxReturnStatus.SUBMITTED);
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

        r.setStatus(TaxReturnStatus.DRAFT);
        r.setAmendmentReason(request.getAmendmentReason());
        r.setAmendedAt(LocalDateTime.now());
        taxReturnRepository.save(r);
        auditLogService.log(user, "TAX_RETURN_AMENDED",
            r.getTaxType() + " return amended: " + request.getAmendmentReason(), ipAddress);

        AmendReturnResponse response = new AmendReturnResponse();
        response.setReturnId(r.getReturnId());
        response.setTaxType(r.getTaxType());
        response.setStatus(TaxReturnStatus.DRAFT);
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

    private LocalDate computeDueDate(String taxType, LocalDate periodEnd, int taxYear) {
        return switch (taxType) {
            case "vat", "paye" -> periodEnd.plusMonths(1).withDayOfMonth(
                periodEnd.plusMonths(1).lengthOfMonth());
            case "income_tax", "withholding" -> LocalDate.of(taxYear + 1, 4, 30);
            default -> periodEnd.plusMonths(1);
        };
    }

    private String toTitle(String taxType) {
        return switch (taxType) {
            case "income_tax" -> "Income Tax";
            case "vat" -> "VAT";
            case "paye" -> "PAYE";
            case "withholding" -> "Withholding Tax";
            default -> taxType;
        };
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
