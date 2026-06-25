package com.taxpadi.api.repository;

import com.taxpadi.api.model.Penalty;
import com.taxpadi.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface PenaltyRepository extends JpaRepository<Penalty, UUID> {
    List<Penalty> findByUser(User user);
    List<Penalty> findByUserAndStatus(User user, String status);
    boolean existsByUserAndTaxTypeAndStatus(User user, String taxType, String status);
    @Query("SELECT COALESCE(SUM(p.penaltyAmount), 0) FROM Penalty p WHERE p.user = :user AND p.status = 'OUTSTANDING'")
    BigDecimal sumOutstandingByUser(@Param("user") User user);
}
