package com.taxpadi.repository;
import com.taxpadi.entity.TaxDeadline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
public interface TaxDeadlineRepository extends JpaRepository<TaxDeadline,Long> {
    List<TaxDeadline> findByIsActiveTrue();
    @Query("SELECT d FROM TaxDeadline d WHERE d.dueDate BETWEEN :from AND :to AND d.isActive=true")
    List<TaxDeadline> findUpcoming(@Param("from") LocalDate from, @Param("to") LocalDate to);
    @Query("SELECT d FROM TaxDeadline d WHERE d.dueDate < :today AND d.status != 'COMPLETED' AND d.isActive=true")
    List<TaxDeadline> findOverdue(@Param("today") LocalDate today);
}
