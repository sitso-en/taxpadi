package com.taxpadi.api.repository;

import com.taxpadi.api.model.SavingsVault;
import com.taxpadi.api.model.VaultTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VaultTransactionRepository extends JpaRepository<VaultTransaction, UUID> {
    Page<VaultTransaction> findByVaultOrderByCreatedAtDesc(SavingsVault vault, Pageable pageable);

    List<VaultTransaction> findByVault(SavingsVault vault);
}
