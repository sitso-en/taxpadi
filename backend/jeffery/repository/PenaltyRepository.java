package com.taxpadi.repository;
import com.taxpadi.entity.Penalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
public interface PenaltyRepository extends JpaRepository<Penalty,Long> {
    List<Penalty> findByUserId(Long userId);
    List<Penalty> findByUserIdAndStatus(Long userId, String status);
    @Query("SELECT COALESCE(SUM(p.penaltyAmount),0) FROM Penalty p WHERE p.userId=:userId AND p.status='OUTSTANDING'")
    BigDecimal sumOutstandingByUserId(@Param("userId") Long userId);
}
