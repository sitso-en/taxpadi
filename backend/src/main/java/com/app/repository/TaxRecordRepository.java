package com.app.repository;
import com.app.entity.TaxRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
public interface TaxRecordRepository extends JpaRepository<TaxRecord,Long> {
    List<TaxRecord> findByUserId(Long userId);
    List<TaxRecord> findByTaxPeriod(String period);
    @Query("SELECT COALESCE(SUM(t.taxAmount),0) FROM TaxRecord t WHERE t.taxPeriod=:period")
    BigDecimal sumTaxByPeriod(@Param("period") String period);
}
