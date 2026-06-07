package com.taxpadi.repository;
import com.taxpadi.entity.VaultTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface VaultTransactionRepository extends JpaRepository<VaultTransaction,Long> {
    Page<VaultTransaction> findByVaultIdOrderByCreatedAtDesc(Long vaultId, Pageable pageable);
}
