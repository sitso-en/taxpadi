package com.taxpadi.api.repository;

import com.taxpadi.api.model.SavingsVault;
import com.taxpadi.api.model.VaultTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface VaultTransactionRepository extends JpaRepository<VaultTransaction, UUID> {
    Page<VaultTransaction> findByVaultOrderByCreatedAtDesc(SavingsVault vault, Pageable pageable);
    List<VaultTransaction> findByVault(SavingsVault vault);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM VaultTransaction t WHERE t.vault = :vault AND t.type = :type AND t.status = 'SUCCESSFUL'")
    BigDecimal sumByVaultAndType(@Param("vault") SavingsVault vault, @Param("type") String type);
}
