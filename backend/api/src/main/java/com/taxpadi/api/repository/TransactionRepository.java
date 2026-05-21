package com.taxpadi.api.repository;

import com.taxpadi.api.model.Transaction;
import com.taxpadi.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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

    Optional<Transaction> findByTransactionIdAndUser(UUID transactionId, User user);
}
