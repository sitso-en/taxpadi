package com.taxpadi.api.repository;

import com.taxpadi.api.model.User;
import com.taxpadi.api.model.VatRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VatRecordRepository extends JpaRepository<VatRecord, UUID> {

    Optional<VatRecord> findByUserAndMonthAndYear(User user, Integer month, Integer year);

    List<VatRecord> findAllByUserOrderByYearDescMonthDesc(User user);

    List<VatRecord> findAllByUserAndYearOrderByMonthDesc(User user, Integer year);
}
