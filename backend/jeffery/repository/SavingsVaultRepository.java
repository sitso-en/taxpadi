package com.taxpadi.repository;
import com.taxpadi.entity.SavingsVault;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface SavingsVaultRepository extends JpaRepository<SavingsVault,Long> {
    Optional<SavingsVault> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
