package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxpadi.api.constant.VatReturnStatus;
import com.taxpadi.api.dto.vat.VatRecordDto;
import com.taxpadi.api.dto.vat.VatRegisterRequest;
import com.taxpadi.api.dto.vat.VatRegisterResponse;
import com.taxpadi.api.dto.vat.VatStatusResponse;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ConflictException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.VatRecord;
import com.taxpadi.api.repository.TransactionRepository;
import com.taxpadi.api.repository.UserTaxProfileRepository;
import com.taxpadi.api.repository.VatRecordRepository;

@Service
public class VatService {

    // VAT registration threshold warning at 80% of GHS 750,000
    private static final BigDecimal VAT_THRESHOLD = new BigDecimal("750000");
    private static final BigDecimal THRESHOLD_WARNING_PCT = new BigDecimal("0.80");
    private static final String EFFECTIVE_RATE = "20%";

    private final VatRecordRepository vatRecordRepository;
    private final GhanaTaxEngine taxEngine;
    private final TransactionRepository transactionRepository;
    private final UserTaxProfileRepository profileRepository;

    public VatService(VatRecordRepository vatRecordRepository, GhanaTaxEngine taxEngine,
            TransactionRepository transactionRepository, UserTaxProfileRepository profileRepository) {
        this.vatRecordRepository = vatRecordRepository;
        this.taxEngine = taxEngine;
        this.transactionRepository = transactionRepository;
        this.profileRepository = profileRepository;
    }

    private boolean isVatRegistered(User user) {
        return profileRepository.findByUser(user)
            .map(p -> Boolean.TRUE.equals(p.getVatRegistered()))
            .orElse(false);
    }

    /**
     * Recompute the VAT record for a month from the user's logged transactions.
     * Output VAT is derived from income (taxable sales); input VAT from deductible
     * expenses (VATable purchases). Only runs for VAT-registered users and never
     * overwrites a return that has already been filed.
     */
    @Transactional
    public void recomputeVatForMonth(User user, int month, int year) {
        if (!isVatRegistered(user)) return;

        LocalDate start = YearMonth.of(year, month).atDay(1);
        LocalDate end = YearMonth.of(year, month).atEndOfMonth();

        BigDecimal sales = Optional.ofNullable(
            transactionRepository.sumAmountByUserAndTypeAndDateRange(user, "income", start, end))
            .orElse(BigDecimal.ZERO);
        BigDecimal purchases = Optional.ofNullable(
            transactionRepository.sumDeductibleExpensesByUserAndDateRange(user, start, end))
            .orElse(BigDecimal.ZERO);

        Optional<VatRecord> existingOpt = vatRecordRepository.findByUserAndMonthAndYear(user, month, year);

        // No activity and no existing record → nothing to track
        if (sales.signum() == 0 && purchases.signum() == 0 && existingOpt.isEmpty()) return;

        VatRecord record = existingOpt.orElseGet(() -> {
            VatRecord r = new VatRecord();
            r.setUser(user);
            r.setMonth(month);
            r.setYear(year);
            r.setReturnStatus(VatReturnStatus.PENDING);
            r.setDueDate(YearMonth.of(year, month).atEndOfMonth().plusMonths(1));
            return r;
        });

        // Never overwrite a filed return
        if (VatReturnStatus.FILED.equals(record.getReturnStatus())) return;

        // Only the 15% VAT is recoverable: net VAT = max(output - input, 0).
        // NHIL and GETFund (2.5% each) are levies on output supplies and are never
        // offset by input credits, so they are added on top in full.
        BigDecimal outputVat = taxEngine.calculateVat(sales);
        BigDecimal inputVat = taxEngine.calculateVat(purchases);
        BigDecimal levies = taxEngine.calculateNhil(sales).add(taxEngine.calculateGetfund(sales));
        BigDecimal net = outputVat.subtract(inputVat).max(BigDecimal.ZERO).add(levies);

        record.setTotalSales(sales);
        record.setOutputVat(outputVat);
        record.setTotalPurchases(purchases);
        record.setInputVat(inputVat);
        record.setNetVatLiability(net);

        vatRecordRepository.save(record);
    }

    /** Backfill VAT records for every month of a year (used right after a user registers). */
    @Transactional
    public void backfillVatForYear(User user, int year) {
        for (int m = 1; m <= 12; m++) {
            recomputeVatForMonth(user, m, year);
        }
    }

    public VatStatusResponse getStatus(User user, Integer month, Integer year) {
        int resolvedMonth = month != null ? month : LocalDate.now().getMonthValue();
        int resolvedYear = year != null ? year : LocalDate.now().getYear();

        boolean vatRegistered = isVatRegistered(user);

        LocalDate yearStart = LocalDate.of(resolvedYear, 1, 1);
        LocalDate yearEnd = LocalDate.of(resolvedYear, 12, 31);
        BigDecimal annualRevenue = Optional.ofNullable(
            transactionRepository.sumAmountByUserAndTypeAndDateRange(user, "income", yearStart, yearEnd))
            .orElse(BigDecimal.ZERO);
        String warning = buildThresholdWarning(annualRevenue);

        VatRecord record = vatRecordRepository
            .findByUserAndMonthAndYear(user, resolvedMonth, resolvedYear)
            .orElse(null);

        // No record for the period (e.g. registered but no activity yet) → return a
        // zero-filled status rather than a 404 so the screen still loads.
        if (record == null) {
            LocalDate dueDate = YearMonth.of(resolvedYear, resolvedMonth).atEndOfMonth().plusMonths(1);
            return new VatStatusResponse(
                resolvedMonth, resolvedYear,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                VatReturnStatus.PENDING, dueDate, null, warning, vatRegistered
            );
        }

        BigDecimal nhil = taxEngine.calculateNhil(record.getTotalSales());
        BigDecimal getfund = taxEngine.calculateGetfund(record.getTotalSales());
        return new VatStatusResponse(
            record.getMonth(), record.getYear(),
            record.getTotalSales(), record.getOutputVat(),
            record.getTotalPurchases(), record.getInputVat(),
            nhil, getfund, record.getNetVatLiability(), record.getReturnStatus(),
            record.getDueDate(), record.getSubmittedAt(), warning, vatRegistered
        );
    }

    @Transactional
    public VatRegisterResponse register(User user, VatRegisterRequest request) {
        validate(request);

        int month = request.getMonth();
        int year = request.getYear();

        if (vatRecordRepository.findByUserAndMonthAndYear(user, month, year).isPresent()) {
            throw new ConflictException("A VAT record already exists for this period. Use the update endpoint.");
        }

        BigDecimal outputVat = taxEngine.calculateVat(request.getTotalSales());
        BigDecimal nhil = taxEngine.calculateNhil(request.getTotalSales());
        BigDecimal getfund = taxEngine.calculateGetfund(request.getTotalSales());
        BigDecimal netLiability = outputVat.subtract(request.getInputVat()).max(BigDecimal.ZERO)
            .add(nhil).add(getfund);

        LocalDate dueDate = YearMonth.of(year, month).atEndOfMonth().plusMonths(1);

        VatRecord record = new VatRecord();
        record.setUser(user);
        record.setMonth(month);
        record.setYear(year);
        record.setTotalSales(request.getTotalSales());
        record.setOutputVat(outputVat);
        record.setTotalPurchases(request.getTotalPurchases());
        record.setInputVat(request.getInputVat());
        record.setNetVatLiability(netLiability);
        record.setReturnStatus(VatReturnStatus.PENDING);
        record.setDueDate(dueDate);

        vatRecordRepository.save(record);

        return new VatRegisterResponse(
            month, year,
            record.getTotalSales(), outputVat,
            record.getTotalPurchases(), record.getInputVat(),
            nhil, getfund, netLiability, EFFECTIVE_RATE, VatReturnStatus.PENDING, dueDate
        );
    }

    @Transactional
    public VatRegisterResponse update(User user, int month, int year, VatRegisterRequest request) {
        VatRecord record = vatRecordRepository
            .findByUserAndMonthAndYear(user, month, year)
            .orElseThrow(() -> new NotFoundException("No VAT record found for this period."));

        if ("FILED".equals(record.getReturnStatus())) {
            throw new BadRequestException("Cannot update a VAT record that has already been filed.");
        }

        if (request.getTotalSales() != null) record.setTotalSales(request.getTotalSales());
        if (request.getTotalPurchases() != null) record.setTotalPurchases(request.getTotalPurchases());
        if (request.getInputVat() != null) record.setInputVat(request.getInputVat());

        BigDecimal outputVat = taxEngine.calculateVat(record.getTotalSales());
        BigDecimal nhil = taxEngine.calculateNhil(record.getTotalSales());
        BigDecimal getfund = taxEngine.calculateGetfund(record.getTotalSales());
        BigDecimal netLiability = outputVat.subtract(record.getInputVat()).max(BigDecimal.ZERO)
            .add(nhil).add(getfund);
        record.setOutputVat(outputVat);
        record.setNetVatLiability(netLiability);

        vatRecordRepository.save(record);

        return new VatRegisterResponse(
            record.getMonth(), record.getYear(),
            record.getTotalSales(), outputVat,
            record.getTotalPurchases(), record.getInputVat(),
            nhil, getfund, netLiability, EFFECTIVE_RATE, record.getReturnStatus(), record.getDueDate()
        );
    }

    public List<VatRecordDto> getHistory(User user, Integer year) {
        List<VatRecord> records = year != null
            ? vatRecordRepository.findAllByUserAndYearOrderByMonthDesc(user, year)
            : vatRecordRepository.findAllByUserOrderByYearDescMonthDesc(user);

        return records.stream()
            .map(r -> new VatRecordDto(
                r.getVatId(), r.getMonth(), r.getYear(),
                r.getTotalSales(), r.getOutputVat(),
                r.getTotalPurchases(), r.getInputVat(),
                taxEngine.calculateNhil(r.getTotalSales()),
                taxEngine.calculateGetfund(r.getTotalSales()),
                r.getNetVatLiability(), r.getReturnStatus(),
                r.getDueDate(), r.getSubmittedAt()
            )).toList();
    }

    private void validate(VatRegisterRequest request) {
        if (request.getMonth() == null || request.getMonth() < 1 || request.getMonth() > 12) {
            throw new BadRequestException("month must be between 1 and 12.");
        }
        if (request.getYear() == null || request.getYear() < 2000) {
            throw new BadRequestException("A valid year is required.");
        }
        if (request.getTotalSales() == null || request.getTotalSales().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("total_sales must be zero or greater.");
        }
        if (request.getTotalPurchases() == null || request.getTotalPurchases().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("total_purchases must be zero or greater.");
        }
        if (request.getInputVat() == null || request.getInputVat().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("input_vat must be zero or greater.");
        }
    }

    private String buildThresholdWarning(BigDecimal totalSales) {
        BigDecimal warningThreshold = VAT_THRESHOLD.multiply(THRESHOLD_WARNING_PCT);
        if (totalSales.compareTo(warningThreshold) >= 0) {
            return "Your taxable sales are approaching or have exceeded the GHS 750,000 VAT registration threshold.";
        }
        return null;
    }
}
