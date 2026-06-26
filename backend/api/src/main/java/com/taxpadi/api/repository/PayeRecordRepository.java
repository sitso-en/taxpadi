package com.taxpadi.api.repository;

import com.taxpadi.api.model.Employee;
import com.taxpadi.api.model.PayeRecord;
import com.taxpadi.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PayeRecordRepository extends JpaRepository<PayeRecord, UUID> {

    Page<PayeRecord> findAllByUser(User user, Pageable pageable);

    Page<PayeRecord> findAllByUserAndMonthAndYear(User user, Integer month, Integer year, Pageable pageable);

    Page<PayeRecord> findAllByUserAndYear(User user, Integer year, Pageable pageable);

    Page<PayeRecord> findAllByUserAndEmployee(User user, Employee employee, Pageable pageable);

    Page<PayeRecord> findAllByUserAndRemitted(User user, Boolean remitted, Pageable pageable);

    List<PayeRecord> findAllByUserAndMonthAndYear(User user, Integer month, Integer year);

    List<PayeRecord> findAllByUserAndYear(User user, Integer year);

    List<PayeRecord> findAllByEmployee(Employee employee);

    Optional<PayeRecord> findByPayeIdAndUser(UUID payeId, User user);

    boolean existsByEmployeeAndMonthAndYear(Employee employee, Integer month, Integer year);
}
