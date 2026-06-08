package com.taxpadi.api.service;

import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.tax.*;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.TaxCalculation;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.TaxCalculationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class TaxCalculationService {

    private static final List<String> VALID_TAX_TYPES = List.of("income_tax", "vat", "paye", "withholding");

    // Simple in-memory rate limiter: userId -> recalculation count this hour
    private final Map<String, AtomicInteger> recalcCounts = new ConcurrentHashMap<>();

    private final TaxCalculationRepository taxCalculationRepository;
    private final GhanaTaxEngine taxEngine;

    public TaxCalculationService(TaxCalculationRepository taxCalculationRepository, GhanaTaxEngine taxEngine) {
        this.taxCalculationRepository = taxCalculationRepository;
        this.taxEngine = taxEngine;
    }

    public TaxLiabilityResponse getLiability(User user) {
        List<TaxCalculation> calculations = taxCalculationRepository.findAllByUser(user);
        if (calculations.isEmpty()) {
            throw new NotFoundException("No tax calculations found. Log your first transaction to get started.");
        }

        int taxYear = LocalDate.now().getYear();
        LocalDate periodStart = LocalDate.of(taxYear, 1, 1);
        LocalDate periodEnd = LocalDate.of(taxYear, 12, 31);

        List<TaxBreakdownItemDto> breakdown = calculations.stream()
            .map(c -> new TaxBreakdownItemDto(
                c.getTaxType(),
                c.getGrossIncome(),
                c.getTotalDeductions(),
                c.getTaxableIncome(),
                c.getTaxLiability(),
                c.getCalculatedAt()
            )).toList();

        BigDecimal total = breakdown.stream()
            .map(TaxBreakdownItemDto::getTaxLiability)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDateTime lastUpdated = calculations.stream()
            .map(TaxCalculation::getCalculatedAt)
            .max(LocalDateTime::compareTo)
            .orElse(LocalDateTime.now());

        return new TaxLiabilityResponse(taxYear, periodStart, periodEnd, total, breakdown, lastUpdated);
    }

    public TaxLiabilityDetailResponse getLiabilityByType(User user, String taxType, Integer year, Integer month) {
        if (!VALID_TAX_TYPES.contains(taxType)) {
            throw new IllegalArgumentException("Tax type must be one of: income_tax, vat, paye, withholding");
        }

        int resolvedYear = year != null ? year : LocalDate.now().getYear();
        LocalDate periodStart;
        LocalDate periodEnd;

        if (taxType.equals("vat") || taxType.equals("paye")) {
            int resolvedMonth = month != null ? month : LocalDate.now().getMonthValue();
            periodStart = LocalDate.of(resolvedYear, resolvedMonth, 1);
            periodEnd = periodStart.withDayOfMonth(periodStart.lengthOfMonth());
        } else {
            periodStart = LocalDate.of(resolvedYear, 1, 1);
            periodEnd = LocalDate.of(resolvedYear, 12, 31);
        }

        TaxCalculation calc = taxCalculationRepository
            .findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(user, taxType, periodStart, periodEnd)
            .orElseThrow(() -> new NotFoundException("No calculations found for this tax type and period"));

        return new TaxLiabilityDetailResponse(
            calc.getTaxType(),
            calc.getPeriodStart(),
            calc.getPeriodEnd(),
            calc.getGrossIncome(),
            calc.getTotalDeductions(),
            calc.getTaxableIncome(),
            calc.getTaxLiability(),
            calc.getCalculatedAt()
        );
    }

    public TaxHistoryResponse getHistory(User user, String taxType, int page, int limit) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 60);
        PageRequest pageable = PageRequest.of(safePage, safeLimit);

        Page<TaxCalculation> results = taxType != null
            ? taxCalculationRepository.findAllByUserAndTaxTypeOrderByPeriodStartDesc(user, taxType, pageable)
            : taxCalculationRepository.findAllByUserOrderByPeriodStartDesc(user, pageable);

        List<TaxHistoryItemDto> history = results.getContent().stream()
            .map(c -> new TaxHistoryItemDto(
                c.getCalculationId(),
                c.getTaxType(),
                c.getPeriodStart(),
                c.getPeriodEnd(),
                c.getGrossIncome(),
                c.getTotalDeductions(),
                c.getTaxableIncome(),
                c.getTaxLiability(),
                c.getCalculatedAt()
            )).toList();

        return new TaxHistoryResponse(
            history,
            new PaginationInfo(results.getTotalElements(), page, safeLimit, results.getTotalPages())
        );
    }

    @Transactional
    public RecalculateResponse recalculate(User user) {
        String userId = user.getUserId().toString();
        recalcCounts.putIfAbsent(userId, new AtomicInteger(0));
        if (recalcCounts.get(userId).incrementAndGet() > 10) {
            throw new IllegalStateException("Too many recalculation requests");
        }

        List<TaxCalculation> calculations = taxCalculationRepository.findAllByUser(user);

        List<String> updated = calculations.stream()
            .map(c -> {
                BigDecimal taxableIncome = c.getGrossIncome().subtract(c.getTotalDeductions());
                c.setTaxableIncome(taxableIncome);

                BigDecimal liability = switch (c.getTaxType()) {
                    case "income_tax"  -> taxEngine.calculateIncomeTax(taxableIncome);
                    case "vat"         -> taxEngine.calculateVat(taxableIncome);
                    case "paye"        -> taxEngine.calculatePaye(taxableIncome);
                    case "withholding" -> c.getTaxLiability();
                    default            -> BigDecimal.ZERO;
                };

                c.setTaxLiability(liability);
                taxCalculationRepository.save(c);
                return c.getTaxType();
            }).toList();

        BigDecimal newTotal = taxCalculationRepository.findAllByUser(user).stream()
            .map(TaxCalculation::getTaxLiability)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new RecalculateResponse(true, updated, newTotal, LocalDateTime.now());
    }
}
