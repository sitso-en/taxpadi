package com.taxpadi.api.repository;                                                           
                
import java.math.BigDecimal;                                                                  
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxpadi.api.model.Invoice;
import com.taxpadi.api.model.User;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Page<Invoice> findAllByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Page<Invoice> findAllByUserAndStatusOrderByCreatedAtDesc(User user, String status,Pageable pageable);

    Page<Invoice> findAllByUserAndCreatedAtBetweenOrderByCreatedAtDesc(
        User user,
        java.time.LocalDateTime from,
        java.time.LocalDateTime to,
        Pageable pageable
    );

    Optional<Invoice> findByInvoiceIdAndUser(UUID invoiceId, User user);

    long countByUserAndInvoiceRefStartingWith(User user, String prefix);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.user = :user AND i.status = :status")
    BigDecimal sumTotalAmountByUserAndStatus(@Param("user") User user, @Param("status") String status);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.user = :user AND i.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") String status);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.user = :user AND i.status = 'unpaid' AND i.dueDate < :today")
    long countOverdueByUser(@Param("user") User user, @Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.user = :user AND i.status = 'unpaid' AND i.dueDate < :today")
    BigDecimal sumOverdueByUser(@Param("user") User user, @Param("today") LocalDate today);
}