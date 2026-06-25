package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxpadi.api.dto.vat.VatRecordDto;
import com.taxpadi.api.dto.vat.VatRegisterRequest;
import com.taxpadi.api.dto.vat.VatRegisterResponse;
import com.taxpadi.api.dto.vat.VatStatusResponse;
import com.taxpadi.api.constant.VatReturnStatus;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.constant.VatReturnStatus;
import com.taxpadi.api.exception.ConflictException;
import com.taxpadi.api.constant.VatReturnStatus;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.VatRecord;
import com.taxpadi.api.repository.TransactionRepository;
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

    public VatService(VatRecordRepository vatRecordRepository, GhanaTaxEngine taxEngine,
            TransactionRepository transactionRepository) {
        this.vatRecordRepository = vatRecordRepository;
        this.taxEngine = taxEngine;
        this.transactionRepository = transactionRepository;
    }

    public VatStatusResponse getStatus(User user, Integer month, Integer year) {
        int resolvedMonth = month != null ? month : LocalDate.now().getMonthValue();
        int resolvedYear = year != null ? year : LocalDate.now().getYear();

        VatRecord record = vatRecordRepository
            .findByUserAndMonthAndYear(user, resolvedMonth, resolvedYear)
            .orElseThrow(() -> new NotFoundException("No VAT record found for this period."));

        LocalDate yearStart = LocalDate.of(resolvedYear, 1, 1);
        LocalDate yearEnd = LocalDate.of(resolvedYear, 12, 31);
        BigDecimal annualRevenue = Optional.ofNullable(
            transactionRepository.sumAmountByUserAndTypeAndDateRange(user, "income", yearStart, yearEnd))
            .orElse(BigDecimal.ZERO);

        String warning = buildThresholdWarning(annualRevenue);

        return new VatStatusResponse(
            record.getMonth(), record.getYear(),
            record.getTotalSales(), record.getOutputVat(),
            record.getTotalPurchases(), record.getInputVat(),
            record.getNetVatLiability(), record.getReturnStatus(),
            record.getDueDate(), record.getSubmittedAt(), warning
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
        BigDecimal netLiability = outputVat.subtract(request.getInputVat()).max(BigDecimal.ZERO);

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
            netLiability, EFFECTIVE_RATE, VatReturnStatus.PENDING, dueDate
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
        BigDecimal netLiability = outputVat.subtract(record.getInputVat()).max(BigDecimal.ZERO);
        record.setOutputVat(outputVat);
        record.setNetVatLiability(netLiability);

        vatRecordRepository.save(record);

        return new VatRegisterResponse(
            record.getMonth(), record.getYear(),
            record.getTotalSales(), outputVat,
            record.getTotalPurchases(), record.getInputVat(),
            netLiability, EFFECTIVE_RATE, record.getReturnStatus(), record.getDueDate()
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
