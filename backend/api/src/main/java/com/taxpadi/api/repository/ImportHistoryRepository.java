package com.taxpadi.api.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxpadi.api.model.ImportHistory;
import com.taxpadi.api.model.User;

public interface ImportHistoryRepository extends JpaRepository<ImportHistory, UUID> {
    List<ImportHistory> findAllByUserOrderByImportedAtDesc(User user);

    boolean existsByUserAndProviderAndStatementFromLessThanEqualAndStatementToGreaterThanEqual(
        User user, String provider, LocalDate statementTo, LocalDate statementFrom
    );
}
