package com.app.repository;
import com.app.entity.Transaction;
import com.app.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
public interface TransactionRepository extends JpaRepository<Transaction,Long> {
    Optional<Transaction> findByReference(String reference);
    Optional<Transaction> findByPaystackReference(String ref);
    Page<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Transaction> findByUserIdAndStatus(Long userId, PaymentStatus status);
    @Query("SELECT COALESCE(SUM(t.taxAmount),0) FROM Transaction t WHERE t.status='SUCCESS' AND t.createdAt BETWEEN :from AND :to")
    BigDecimal sumTaxCollected(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
    @Query("SELECT COALESCE(SUM(t.totalAmount),0) FROM Transaction t WHERE t.status='SUCCESS' AND t.createdAt BETWEEN :from AND :to")
    BigDecimal sumRevenueCollected(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
