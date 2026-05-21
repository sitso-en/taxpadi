package com.taxpadi.api.service;

import com.taxpadi.api.dto.withholding.WhtRemitRequest;
import com.taxpadi.api.dto.withholding.WhtTransactionDto;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.Transaction;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class WithholdingService {

    private final TransactionRepository transactionRepository;

    public WithholdingService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Map<String, Object> getTransactions(User user, Boolean remitted, String category,
                                               LocalDate dateFrom, LocalDate dateTo,
                                               int page, int limit) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);

        Page<Transaction> results = transactionRepository.findWhtTransactions(
            user, remitted, category, dateFrom, dateTo, PageRequest.of(safePage, safeLimit)
        );

        List<WhtTransactionDto> transactions = results.getContent().stream()
            .map(this::toDto).toList();

        BigDecimal totalWithheld = sum(results.getContent(), Transaction::getWithholdingAmount);
        
        BigDecimal totalRemitted = results.getContent().stream()
            .filter(Transaction::getWithholdingRemitted)
            .map(Transaction::getWithholdingAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
            "transactions", transactions,
            "summary", Map.of(
                "total_withheld", totalWithheld,
                "total_remitted", totalRemitted,
                "total_outstanding", totalWithheld.subtract(totalRemitted)
            ),
            "pagination", Map.of(
                "total", results.getTotalElements(),
                "page", page,
                "limit", safeLimit,
                "total_pages", results.getTotalPages()
            )
        );
    }

    @Transactional
    public Map<String, Object> remit(User user, UUID transactionId, WhtRemitRequest request) {
        Transaction tx = transactionRepository.findByTransactionIdAndUser(transactionId, user)
            .orElseThrow(() -> new NotFoundException("No withholding transaction found with this ID."));

        if (!tx.getWithholdingApplicable()) {
            throw new BadRequestException("This transaction is not flagged as withholding-applicable.");
        }
        if (tx.getWithholdingRemitted()) {
            throw new BadRequestException("This withholding transaction has already been marked as remitted.");
        }

        tx.setWithholdingRemitted(true);
        tx.setWithholdingRemittedAt(
            request != null && request.getRemittedAt() != null ? request.getRemittedAt() : LocalDateTime.now()
        );
        transactionRepository.save(tx);

        return Map.of(
            "transaction_id", tx.getTransactionId(),
            "description", tx.getDescription() != null ? tx.getDescription() : "",
            "category", tx.getCategory(),
            "amount", tx.getAmount(),
            "withholding_amount", tx.getWithholdingAmount(),
            "remitted", true,
            "remitted_at", tx.getWithholdingRemittedAt()
        );
    }

    private WhtTransactionDto toDto(Transaction tx) {
        return new WhtTransactionDto(
            tx.getTransactionId(),
            tx.getDescription(),
            tx.getCategory(),
            tx.getTransactionDate(),
            tx.getAmount(),
            deriveRate(tx.getCategory()),
            tx.getWithholdingAmount(),
            tx.getWithholdingRemitted(),
            tx.getWithholdingRemittedAt()
        );
    }

    private String deriveRate(String category) {
        return switch (category.toLowerCase()) {
            case "dividend"                 -> "8%";
            case "interest"                 -> "8%";
            case "rent"                     -> "8%";
            case "royalty"                  -> "15%";
            case "contractor_payment"       -> "5%";
            case "non_resident_contractor"  -> "20%";
            default                         -> "N/A";
        };
    }

    private BigDecimal sum(List<Transaction> list, java.util.function.Function<Transaction, BigDecimal> fn) {
        return list.stream().map(fn).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
