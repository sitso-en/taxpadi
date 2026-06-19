package com.taxpadi.api.service;

import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.vault.*;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.SavingsVault;
import com.taxpadi.api.model.Transaction;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.VaultTransaction;
import com.taxpadi.api.repository.SavingsVaultRepository;
import com.taxpadi.api.repository.TransactionRepository;
import com.taxpadi.api.repository.VaultTransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SavingsVaultService {

    private final SavingsVaultRepository vaultRepo;
    private final VaultTransactionRepository txnRepo;
    private final TransactionRepository transactionRepo;

    public SavingsVaultService(SavingsVaultRepository vaultRepo,
                                VaultTransactionRepository txnRepo,
                                TransactionRepository transactionRepo) {
        this.vaultRepo = vaultRepo;
        this.txnRepo = txnRepo;
        this.transactionRepo = transactionRepo;
    }

    public VaultDto getVault(User user) {
        SavingsVault vault = requireVault(user);
        return toVaultDto(vault);
    }

    @Transactional
    public LinkMomoResponse linkMomo(User user, LinkMomoRequest request) {
        SavingsVault vault = requireVault(user);
        vault.setLinkedMomoNumber(request.getMomoNumber());
        vault.setLinkedMomoProvider(request.getMomoProvider());
        vaultRepo.save(vault);

        LinkMomoResponse resp = new LinkMomoResponse();
        resp.setVaultId(vault.getVaultId());
        resp.setLinkedMomoNumber(vault.getLinkedMomoNumber());
        resp.setLinkedMomoProvider(vault.getLinkedMomoProvider());
        resp.setMomoLinked(true);
        resp.setUpdatedAt(vault.getUpdatedAt());
        return resp;
    }

    @Transactional
    public ContributeResponse contribute(User user, ContributeRequest request) {
        SavingsVault vault = requireVault(user);
        if (vault.getLinkedMomoNumber() == null) {
            throw new BadRequestException("Please link a MoMo number to your vault before contributing.");
        }

        VaultTransaction txn = new VaultTransaction();
        txn.setVault(vault);
        txn.setType("DEPOSIT");
        txn.setAmount(request.getAmount());
        txn.setBalanceAfter(vault.getBalance().add(request.getAmount()));
        txn.setTrigger(request.getTrigger().toUpperCase());
        txn.setStatus("PENDING");
        txn.setDescription("Vault contribution via MoMo");
        txn.setReference("VLT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        txnRepo.save(txn);

        ContributeResponse resp = new ContributeResponse();
        resp.setVaultTransactionId(txn.getTransactionId());
        resp.setAmount(request.getAmount());
        resp.setTrigger(txn.getTrigger());
        resp.setStatus("PENDING");
        resp.setMomoPromptSent(true);
        resp.setMessage("A payment prompt of GHS " + request.getAmount() + " has been sent. Please approve it.");
        resp.setNewBalanceOnConfirmation(txn.getBalanceAfter());
        return resp;
    }

    public VaultTransactionsResponse getTransactions(User user, int page, int limit) {
        SavingsVault vault = requireVault(user);
        Page<VaultTransaction> pageResult = txnRepo.findByVaultOrderByCreatedAtDesc(
                vault, PageRequest.of(page - 1, limit));

        List<VaultTransactionDto> dtos = pageResult.getContent().stream()
                .map(this::toTxnDto)
                .collect(Collectors.toList());

        BigDecimal totalCredited = pageResult.getContent().stream()
                .filter(t -> "DEPOSIT".equals(t.getType()) && "SUCCESSFUL".equals(t.getStatus()))
                .map(VaultTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDebited = pageResult.getContent().stream()
                .filter(t -> "WITHDRAWAL".equals(t.getType()) && "SUCCESSFUL".equals(t.getStatus()))
                .map(VaultTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        VaultTxnSummary summary = new VaultTxnSummary(totalCredited, totalDebited, vault.getBalance());
        PaginationInfo pagination = new PaginationInfo(
                pageResult.getTotalElements(), page, limit, pageResult.getTotalPages());
        return new VaultTransactionsResponse(dtos, summary, pagination);
    }

    public VaultSuggestionDto getSuggestion(User user) {
        SavingsVault vault = requireVault(user);
        Transaction latest = transactionRepo
                .findTopByUserAndTypeOrderByTransactionDateDesc(user, "income")
                .orElseThrow(() -> new NotFoundException("No income transactions found to base a suggestion on."));

        BigDecimal latestIncome = latest.getAmount();
        // Apply marginal rate of 17.5% as a representative rate
        BigDecimal marginalRate = new BigDecimal("0.175");
        BigDecimal suggested = latestIncome.multiply(marginalRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal currentLiability = vault.getTargetAmount();
        BigDecimal alreadySaved = vault.getBalance();
        BigDecimal remaining = currentLiability.subtract(alreadySaved).max(BigDecimal.ZERO);

        if (alreadySaved.compareTo(currentLiability) >= 0) {
            suggested = BigDecimal.ZERO;
        }

        VaultSuggestionBasedOn basedOn = new VaultSuggestionBasedOn(
                latestIncome, "17.5%", currentLiability, alreadySaved, remaining);

        VaultSuggestionDto dto = new VaultSuggestionDto();
        dto.setSuggestedAmount(suggested);
        dto.setBasedOn(basedOn);
        dto.setMessage("Based on your latest income of GHS " + latestIncome +
                " we suggest saving GHS " + suggested + " toward your tax bill.");
        return dto;
    }

    private SavingsVault requireVault(User user) {
        return vaultRepo.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Vault not found for this user."));
    }

    private VaultDto toVaultDto(SavingsVault v) {
        VaultDto dto = new VaultDto();
        dto.setVaultId(v.getVaultId());
        dto.setBalance(v.getBalance());
        dto.setLinkedMomoNumber(v.getLinkedMomoNumber());
        dto.setLinkedMomoProvider(v.getLinkedMomoProvider());
        dto.setMomoLinked(v.getLinkedMomoNumber() != null);

        // Compute totals from transaction history (confirmed only)
        List<VaultTransaction> allTxns = txnRepo.findByVault(v);
        BigDecimal totalIn = allTxns.stream()
                .filter(t -> "DEPOSIT".equals(t.getType()) && "SUCCESSFUL".equals(t.getStatus()))
                .map(VaultTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOut = allTxns.stream()
                .filter(t -> "WITHDRAWAL".equals(t.getType()) && "SUCCESSFUL".equals(t.getStatus()))
                .map(VaultTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalContributed(totalIn);
        dto.setTotalWithdrawn(totalOut);

        if (v.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            double pct = v.getBalance().divide(v.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
            BigDecimal remaining = v.getTargetAmount().subtract(v.getBalance()).max(BigDecimal.ZERO);
            dto.setTarget(new VaultTarget(v.getTargetAmount(), pct, remaining));
        }
        return dto;
    }

    private VaultTransactionDto toTxnDto(VaultTransaction t) {
        VaultTransactionDto dto = new VaultTransactionDto();
        dto.setVaultTransactionId(t.getTransactionId());
        dto.setType(t.getType());
        dto.setAmount(t.getAmount());
        dto.setTrigger(t.getTrigger());
        dto.setMomoReference(t.getMomoReference());
        dto.setStatus(t.getStatus());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setConfirmedAt(t.getConfirmedAt());
        return dto;
    }
}
