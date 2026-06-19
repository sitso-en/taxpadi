package com.taxpadi.api.repository;

import com.taxpadi.api.model.Transaction;
import com.taxpadi.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("""
        SELECT t FROM Transaction t
        WHERE t.user = :user
          AND t.withholdingApplicable = true
          AND (:remitted IS NULL OR t.withholdingRemitted = :remitted)
          AND (:category IS NULL OR t.category = :category)
          AND (:dateFrom IS NULL OR t.transactionDate >= :dateFrom)
          AND (:dateTo IS NULL OR t.transactionDate <= :dateTo)
        ORDER BY t.transactionDate DESC
        """)
    Page<Transaction> findWhtTransactions(
        @Param("user") User user,
        @Param("remitted") Boolean remitted,
        @Param("category") String category,
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo") LocalDate dateTo,
        Pageable pageable
    );

    @Query("""
      SELECT t FROM Transaction t
      WHERE t.user = :user
        AND (:type IS NULL OR t.type = :type)
        AND (:category IS NULL OR t.category = :category)
        AND (:entryMethod IS NULL OR t.entryMethod = :entryMethod)
        AND (:taxDeductible IS NULL OR t.taxDeductible = :taxDeductible)
        AND (:withholdingApplicable IS NULL OR t.withholdingApplicable = :withholdingApplicable)
        AND (:dateFrom IS NULL OR t.transactionDate >= :dateFrom)
        AND (:dateTo IS NULL OR t.transactionDate <= :dateTo)
      ORDER BY t.transactionDate DESC
      """)
    Page<Transaction> findFiltered(
        @Param("user") User user,
        @Param("type") String type,
        @Param("category") String category,
        @Param("entryMethod") String entryMethod,
        @Param("taxDeductible") Boolean taxDeductible,
        @Param("withholdingApplicable") Boolean withholdingApplicable,
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo") LocalDate dateTo,
        Pageable pageable
    );

    Optional<Transaction> findByTransactionIdAndUser(UUID transactionId, User user);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.transactionDate >= :from AND t.transactionDate <= :to")
    BigDecimal sumAmountByUserAndTypeAndDateRange(
        @Param("user") User user,
        @Param("type") String type,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.taxDeductible = true AND t.type = 'expense' AND t.transactionDate >= :from AND t.transactionDate <= :to")
    BigDecimal sumDeductibleExpensesByUserAndDateRange(
        @Param("user") User user,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("SELECT t.category, SUM(t.amount), COUNT(t) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.transactionDate >= :from AND t.transactionDate <= :to GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> sumByCategoryAndType(
        @Param("user") User user,
        @Param("type") String type,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("SELECT EXTRACT(YEAR FROM t.transactionDate), EXTRACT(MONTH FROM t.transactionDate), SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.transactionDate >= :from AND t.transactionDate <= :to GROUP BY EXTRACT(YEAR FROM t.transactionDate), EXTRACT(MONTH FROM t.transactionDate) ORDER BY EXTRACT(YEAR FROM t.transactionDate), EXTRACT(MONTH FROM t.transactionDate)")
    List<Object[]> sumByMonth(
        @Param("user") User user,
        @Param("type") String type,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user = :user AND t.transactionDate >= :from AND t.transactionDate <= :to")
    long countByUserAndDateRange(
        @Param("user") User user,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.createdAt >= :from AND t.createdAt <= :to")
    long countByCreatedAtBetween(
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    Optional<Transaction> findTopByUserAndTypeOrderByTransactionDateDesc(User user, String type);
}
