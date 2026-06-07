package com.taxpadi.service;
import com.taxpadi.entity.SavingsVault;
import com.taxpadi.entity.VaultTransaction;
import com.taxpadi.repository.SavingsVaultRepository;
import com.taxpadi.repository.VaultTransactionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class SavingsVaultService {
    private final SavingsVaultRepository vaultRepo;
    private final VaultTransactionRepository txnRepo;

    public SavingsVaultService(SavingsVaultRepository vaultRepo, VaultTransactionRepository txnRepo) {
        this.vaultRepo = vaultRepo; this.txnRepo = txnRepo;
    }

    public SavingsVault getVault(Long userId) {
        return vaultRepo.findByUserId(userId).orElseThrow(() -> new RuntimeException("Vault not found"));
    }

    @Transactional
    public SavingsVault create(Long userId, Map<String,Object> req) {
        if (vaultRepo.existsByUserId(userId)) throw new RuntimeException("You already have a savings vault");
        SavingsVault v = new SavingsVault();
        v.setUserId(userId);
        v.setVaultName((String) req.getOrDefault("vaultName","My Tax Savings Vault"));
        v.setPurpose((String) req.getOrDefault("purpose","GENERAL_TAX"));
        if (req.containsKey("targetAmount")) v.setTargetAmount(new BigDecimal(req.get("targetAmount").toString()));
        if (req.containsKey("autoSaveAmount")) { v.setAutoSaveAmount(new BigDecimal(req.get("autoSaveAmount").toString())); v.setAutoSaveEnabled(true); }
        return vaultRepo.save(v);
    }

    @Transactional
    public Map<String,Object> deposit(Long userId, BigDecimal amount, String description) {
        SavingsVault v = getVault(userId);
        if (!"ACTIVE".equals(v.getStatus())) throw new RuntimeException("Vault is " + v.getStatus());
        v.setBalance(v.getBalance().add(amount));
        v.setUpdatedAt(LocalDateTime.now());
        vaultRepo.save(v);
        VaultTransaction t = new VaultTransaction();
        t.setVaultId(v.getId()); t.setUserId(userId); t.setType("DEPOSIT");
        t.setAmount(amount); t.setBalanceAfter(v.getBalance());
        t.setDescription(description != null ? description : "Deposit");
        t.setReference("DEP-" + UUID.randomUUID().toString().substring(0,8).toUpperCase());
        txnRepo.save(t);
        Map<String,Object> r = new HashMap<>();
        r.put("newBalance", v.getBalance()); r.put("amountDeposited", amount); r.put("reference", t.getReference());
        r.put("progressToTarget", v.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
            ? v.getBalance().divide(v.getTargetAmount(),4,RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO);
        return r;
    }

    @Transactional
    public Map<String,Object> withdraw(Long userId, BigDecimal amount, String description) {
        SavingsVault v = getVault(userId);
        if (v.getBalance().compareTo(amount) < 0) throw new RuntimeException("Insufficient balance");
        v.setBalance(v.getBalance().subtract(amount));
        v.setUpdatedAt(LocalDateTime.now());
        vaultRepo.save(v);
        VaultTransaction t = new VaultTransaction();
        t.setVaultId(v.getId()); t.setUserId(userId); t.setType("WITHDRAWAL");
        t.setAmount(amount); t.setBalanceAfter(v.getBalance());
        t.setDescription(description != null ? description : "Withdrawal");
        t.setReference("WTH-" + UUID.randomUUID().toString().substring(0,8).toUpperCase());
        txnRepo.save(t);
        Map<String,Object> r = new HashMap<>();
        r.put("newBalance", v.getBalance()); r.put("amountWithdrawn", amount); r.put("reference", t.getReference());
        return r;
    }

    public List<VaultTransaction> getHistory(Long userId, int page, int size) {
        SavingsVault v = getVault(userId);
        return txnRepo.findByVaultIdOrderByCreatedAtDesc(v.getId(), PageRequest.of(page,size)).getContent();
    }

    @Transactional
    public SavingsVault updateSettings(Long userId, Map<String,Object> req) {
        SavingsVault v = getVault(userId);
        if (req.containsKey("vaultName")) v.setVaultName((String) req.get("vaultName"));
        if (req.containsKey("targetAmount")) v.setTargetAmount(new BigDecimal(req.get("targetAmount").toString()));
        if (req.containsKey("autoSaveAmount")) v.setAutoSaveAmount(new BigDecimal(req.get("autoSaveAmount").toString()));
        if (req.containsKey("autoSaveFrequency")) v.setAutoSaveFrequency((String) req.get("autoSaveFrequency"));
        if (req.containsKey("autoSaveEnabled")) v.setAutoSaveEnabled((Boolean) req.get("autoSaveEnabled"));
        v.setUpdatedAt(LocalDateTime.now());
        return vaultRepo.save(v);
    }
}
