package com.taxpadi.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.taxpadi.api.model.SavingsVault;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DataExportService {

    private static final Logger log = LoggerFactory.getLogger(DataExportService.class);

    private final TransactionRepository transactionRepository;
    private final InvoiceRepository invoiceRepository;
    private final TaxReturnRepository taxReturnRepository;
    private final TaxCalculationRepository taxCalculationRepository;
    private final VatRecordRepository vatRecordRepository;
    private final AuditLogRepository auditLogRepository;
    private final SavingsVaultRepository savingsVaultRepository;
    private final VaultTransactionRepository vaultTransactionRepository;
    private final EmailService emailService;

    public DataExportService(TransactionRepository transactionRepository,
                             InvoiceRepository invoiceRepository,
                             TaxReturnRepository taxReturnRepository,
                             TaxCalculationRepository taxCalculationRepository,
                             VatRecordRepository vatRecordRepository,
                             AuditLogRepository auditLogRepository,
                             SavingsVaultRepository savingsVaultRepository,
                             VaultTransactionRepository vaultTransactionRepository,
                             EmailService emailService) {
        this.transactionRepository = transactionRepository;
        this.invoiceRepository = invoiceRepository;
        this.taxReturnRepository = taxReturnRepository;
        this.taxCalculationRepository = taxCalculationRepository;
        this.vatRecordRepository = vatRecordRepository;
        this.auditLogRepository = auditLogRepository;
        this.savingsVaultRepository = savingsVaultRepository;
        this.vaultTransactionRepository = vaultTransactionRepository;
        this.emailService = emailService;
    }

    public void exportAndSend(User user) {
        try {
            Map<String, Object> export = new LinkedHashMap<>();

            export.put("profile", Map.of(
                "user_id", user.getUserId(),
                "full_name", user.getFullName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "tin", user.getTin() != null ? user.getTin() : "",
                "region", user.getRegion() != null ? user.getRegion() : "",
                "taxpayer_category", user.getTaxpayerCategory() != null ? user.getTaxpayerCategory() : "",
                "created_at", user.getCreatedAt()
            ));

            export.put("transactions", transactionRepository
                .findAllByUserOrderByTransactionDateDesc(user).stream()
                .map(t -> Map.of(
                    "id", t.getTransactionId(),
                    "type", t.getType(),
                    "amount", t.getAmount(),
                    "category", t.getCategory() != null ? t.getCategory() : "",
                    "description", t.getDescription() != null ? t.getDescription() : "",
                    "date", t.getTransactionDate(),
                    "entry_method", t.getEntryMethod() != null ? t.getEntryMethod() : "",
                    "tax_deductible", t.getTaxDeductible()
                )).toList());

            export.put("invoices", invoiceRepository
                .findAllByUserOrderByCreatedAtDesc(user).stream()
                .map(i -> Map.of(
                    "id", i.getInvoiceId(),
                    "ref", i.getInvoiceRef(),
                    "client", i.getClientName(),
                    "total", i.getTotalAmount(),
                    "status", i.getStatus(),
                    "due_date", i.getDueDate() != null ? i.getDueDate().toString() : "",
                    "created_at", i.getCreatedAt()
                )).toList());

            export.put("tax_calculations", taxCalculationRepository
                .findAllByUser(user).stream()
                .map(c -> Map.of(
                    "id", c.getCalculationId(),
                    "tax_type", c.getTaxType(),
                    "tax_liability", c.getTaxLiability(),
                    "period_start", c.getPeriodStart(),
                    "period_end", c.getPeriodEnd()
                )).toList());

            export.put("tax_returns", taxReturnRepository
                .findAllByUserAndYearRange(user, 2000, 2100).stream()
                .map(r -> Map.of(
                    "id", r.getReturnId(),
                    "tax_type", r.getTaxType(),
                    "tax_year", r.getTaxYear(),
                    "status", r.getStatus(),
                    "tax_liability", r.getTaxLiability(),
                    "submitted_at", r.getSubmittedAt() != null ? r.getSubmittedAt().toString() : ""
                )).toList());

            export.put("vat_records", vatRecordRepository
                .findAllByUserOrderByYearDescMonthDesc(user).stream()
                .map(v -> Map.of(
                    "id", v.getVatId(),
                    "month", v.getMonth(),
                    "year", v.getYear(),
                    "output_vat", v.getOutputVat(),
                    "input_vat", v.getInputVat(),
                    "net_vat_liability", v.getNetVatLiability(),
                    "status", v.getReturnStatus()
                )).toList());

            Optional<SavingsVault> vault = savingsVaultRepository.findByUser(user);
            if (vault.isPresent()) {
                SavingsVault v = vault.get();
                export.put("savings_vault", Map.of(
                    "balance", v.getBalance(),
                    "target_amount", v.getTargetAmount(),
                    "transactions", vaultTransactionRepository.findByVault(v).stream()
                        .map(vt -> Map.of(
                            "id", vt.getTransactionId(),
                            "type", vt.getType(),
                            "amount", vt.getAmount(),
                            "trigger", vt.getTrigger(),
                            "status", vt.getStatus(),
                            "created_at", vt.getCreatedAt()
                        )).toList()
                ));
            }

            export.put("audit_log", auditLogRepository
                .findAllByUserOrderByCreatedAtDesc(user, Pageable.unpaged())
                .stream()
                .map(a -> Map.of(
                    "action", a.getAction(),
                    "detail", a.getDetail() != null ? a.getDetail() : "",
                    "ip_address", a.getIpAddress() != null ? a.getIpAddress() : "",
                    "created_at", a.getCreatedAt()
                )).toList());

            ObjectMapper mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

            String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(export);
            emailService.sendDataExport(user.getEmail(), user.getFullName(), json);
            log.info("Data export sent to userId={}", user.getUserId());

        } catch (Exception e) {
            log.error("Data export failed for userId={}: {}", user.getUserId(), e.getMessage());
        }
    }
}
