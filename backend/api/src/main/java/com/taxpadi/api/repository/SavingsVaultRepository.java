package com.taxpadi.api.repository;

import com.taxpadi.api.model.SavingsVault;
import com.taxpadi.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SavingsVaultRepository extends JpaRepository<SavingsVault, UUID> {
    Optional<SavingsVault> findByUser(User user);
    boolean existsByUser(User user);
}
