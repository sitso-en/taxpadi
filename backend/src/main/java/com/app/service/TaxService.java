package com.app.service;
import com.app.entity.TaxRecord;
import com.app.entity.Transaction;
import com.app.entity.User;
import com.app.repository.TaxRecordRepository;
import com.app.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class TaxService {
    private final TaxRecordRepository taxRecordRepository;
    private final TransactionRepository transactionRepository;

    @Value("${tax.rate}") private BigDecimal taxRate;

    public BigDecimal calculateTax(BigDecimal baseAmount) {
        return baseAmount.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
    }
    public BigDecimal calculateTotal(BigDecimal baseAmount) {
        return baseAmount.add(calculateTax(baseAmount)).setScale(2, RoundingMode.HALF_UP);
    }
    public BigDecimal getTaxRate() { return taxRate; }
    public BigDecimal totalVatCollected(LocalDateTime from, LocalDateTime to) {
        return transactionRepository.sumTaxCollected(from, to);
    }

    @Transactional
    public TaxRecord recordTax(Transaction transaction, User user) {
        String period = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String receiptNumber = "TAX-" + UUID.randomUUID().toString().substring(0,8).toUpperCase();
        TaxRecord record = TaxRecord.builder()
                .transaction(transaction).user(user).taxType("VAT")
                .taxRate(taxRate).taxableAmount(transaction.getBaseAmount())
                .taxAmount(transaction.getTaxAmount()).receiptNumber(receiptNumber).taxPeriod(period).build();
        return taxRecordRepository.save(record);
    }

    public List<TaxRecord> getUserTaxRecords(Long userId) {
        return taxRecordRepository.findByUserId(userId);
    }
}
