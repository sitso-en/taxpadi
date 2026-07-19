package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxpadi.api.constant.VaultTransactionStatus;
import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.vault.ContributeRequest;
import com.taxpadi.api.dto.vault.ContributeResponse;
import com.taxpadi.api.dto.vault.LinkMomoRequest;
import com.taxpadi.api.dto.vault.LinkMomoResponse;
import com.taxpadi.api.dto.vault.VaultDto;
import com.taxpadi.api.dto.vault.VaultSuggestionBasedOn;
import com.taxpadi.api.dto.vault.VaultSuggestionDto;
import com.taxpadi.api.dto.vault.VaultTarget;
import com.taxpadi.api.dto.vault.VaultTransactionDto;
import com.taxpadi.api.dto.vault.VaultTransactionsResponse;
import com.taxpadi.api.dto.vault.VaultTxnSummary;
import com.taxpadi.api.constant.SubscriptionStatus;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.NotificationType;
import com.taxpadi.api.model.SavingsVault;
import com.taxpadi.api.model.Transaction;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.VaultTransaction;
import com.taxpadi.api.repository.SavingsVaultRepository;
import com.taxpadi.api.repository.SubscriptionRepository;
import com.taxpadi.api.repository.TransactionRepository;
import com.taxpadi.api.repository.VaultTransactionRepository;

@Service
public class SavingsVaultService {

    private final SavingsVaultRepository vaultRepo;
    private final VaultTransactionRepository txnRepo;
    private final TransactionRepository transactionRepo;
    private final NotificationService notificationService;
    private final SubscriptionRepository subscriptionRepository;

    public SavingsVaultService(SavingsVaultRepository vaultRepo,
                                VaultTransactionRepository txnRepo,
                                TransactionRepository transactionRepo,
                                NotificationService notificationService,
                                SubscriptionRepository subscriptionRepository) {
        this.vaultRepo = vaultRepo;
        this.txnRepo = txnRepo;
        this.transactionRepo = transactionRepo;
        this.notificationService = notificationService;
        this.subscriptionRepository = subscriptionRepository;
    }

    private void requirePaidSubscription(User user) {
        if (!subscriptionRepository.existsByUserAndStatus(user, SubscriptionStatus.ACTIVE)) {
            throw new ForbiddenException("The Tax Savings Vault requires an active TaxPadi subscription.");
        }
    }

    @Transactional
    public VaultDto getVault(User user) {
        requirePaidSubscription(user);
        SavingsVault vault = requireVault(user);
        return toVaultDto(vault);
    }

    @Transactional
    public LinkMomoResponse linkMomo(User user, LinkMomoRequest request) {
        requirePaidSubscription(user);
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
        requirePaidSubscription(user);
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
        txn.setStatus(VaultTransactionStatus.PENDING);
        txn.setDescription("Vault contribution via MoMo");
        txn.setReference("VLT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        txnRepo.save(txn);

        ContributeResponse resp = new ContributeResponse();
        resp.setVaultTransactionId(txn.getTransactionId());
        resp.setAmount(request.getAmount());
        resp.setTrigger(txn.getTrigger());
        resp.setStatus(VaultTransactionStatus.PENDING);
        resp.setMomoPromptSent(true);
        resp.setMessage("A payment prompt of GHS " + request.getAmount() + " has been sent. Please approve it.");
        resp.setNewBalanceOnConfirmation(txn.getBalanceAfter());
        return resp;
    }

    public VaultTransactionsResponse getTransactions(User user, int page, int limit) {
        requirePaidSubscription(user);
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

    @Transactional(readOnly = true)
    public VaultSuggestionDto getSuggestion(User user) {
        requirePaidSubscription(user);
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
        String message = "Based on your latest income of GHS " + latestIncome +
                " we suggest saving GHS " + suggested + " toward your tax bill.";
        dto.setMessage(message);

        if (suggested.compareTo(BigDecimal.ZERO) > 0) {
            notificationService.send(user,
                "Tax Savings Suggestion",
                message,
                NotificationType.VAULT,
                "/vault");
        }
        return dto;
    }

    private SavingsVault requireVault(User user) {
        return vaultRepo.findByUser(user).orElseGet(() -> {
            SavingsVault vault = new SavingsVault();
            vault.setUser(user);
            vault.setVaultName("Tax Savings Vault");
            vault.setBalance(BigDecimal.ZERO);
            vault.setTargetAmount(BigDecimal.ZERO);
            vault.setAutoSaveAmount(BigDecimal.ZERO);
            return vaultRepo.save(vault);
        });
    }

    private VaultDto toVaultDto(SavingsVault v) {
        VaultDto dto = new VaultDto();
        dto.setVaultId(v.getVaultId());
        dto.setBalance(v.getBalance());
        dto.setLinkedMomoNumber(v.getLinkedMomoNumber());
        dto.setLinkedMomoProvider(v.getLinkedMomoProvider());
        dto.setMomoLinked(v.getLinkedMomoNumber() != null);

        // Compute totals via aggregation queries (avoids loading all transactions into memory)
        dto.setTotalContributed(txnRepo.sumByVaultAndType(v, "DEPOSIT"));
        dto.setTotalWithdrawn(txnRepo.sumByVaultAndType(v, "WITHDRAWAL"));

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
