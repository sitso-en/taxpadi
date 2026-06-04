package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import java.io.InputStreamReader;

import java.io.BufferedReader;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ConflictException;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.ImportHistory;
import com.taxpadi.api.model.TaxCalculation;
import com.taxpadi.api.model.Transaction;
import com.taxpadi.api.repository.ImportHistoryRepository;
import com.taxpadi.api.repository.TaxCalculationRepository;
import com.taxpadi.api.repository.TransactionRepository;

import com.taxpadi.api.model.User;

@Service
public class TransactionService {

    private static final BigDecimal VAULT_SUGGESTION_RATE = new BigDecimal("0.25");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final List<String> AMBIGUOUS_KEYWORDS = List.of(
        "transfer", "float", "commission", "adjustment");

    private final TransactionRepository transactionRepository;
    private final ImportHistoryRepository importHistoryRepository;
    private final TaxCalculationRepository taxCalculationRepository;
    private final GhanaTaxEngine taxEngine;
    private final AuditLogService auditLogService;

    public TransactionService(TransactionRepository transactionRepository,
            ImportHistoryRepository importHistoryRepository,
            TaxCalculationRepository taxCalculationRepository,
            GhanaTaxEngine taxEngine,
            AuditLogService auditLogService) {
        this.transactionRepository = transactionRepository;
        this.importHistoryRepository = importHistoryRepository;
        this.taxCalculationRepository = taxCalculationRepository;
        this.taxEngine = taxEngine;
        this.auditLogService = auditLogService;
    }


    public Map<String, Object> getTransactions(User user, String type, String category,
            String entryMethod, Boolean taxDeductible, Boolean withholdingApplicable,
            LocalDate dateFrom, LocalDate dateTo, int page, int limit) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);

        Page<Transaction> results = transactionRepository.findFiltered(
            user, type, category, entryMethod, taxDeductible, withholdingApplicable,
            dateFrom, dateTo, PageRequest.of(safePage, safeLimit));

        List<Map<String, Object>> transactions = results.getContent().stream()
            .map(this::toSummary).toList();

        return Map.of(
            "transactions", transactions,
            "pagination", Map.of(
                "total", results.getTotalElements(),
                "page", page,
                "limit", safeLimit,
                "total_pages", results.getTotalPages()
            )
        );
    }


    @Transactional
    public Map<String, Object> createTransaction(User user, Map<String, Object> body) {
        String type = requireString(body, "type");
        
        if (!type.equals("income") && !type.equals("expense")) {
            throw new BadRequestException("Type must be income or expense");
        }

        BigDecimal amount = requirePositiveDecimal(body, "amount");
        String category = requireString(body, "category");
        LocalDate transactionDate = requireDate(body, "transaction_date");

        if (transactionDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("Transaction date cannot be in the future");
        }

        boolean taxDeductible = boolOrFalse(body, "tax_deductible");

        boolean withholdingApplicable = boolOrFalse(body, "withholding_applicable");

        String description = (String) body.get("description");

        Transaction t = new Transaction();
        t.setUser(user);
        t.setType(type);
        t.setAmount(amount);
        t.setCategory(category);
        t.setDescription(description);
        t.setEntryMethod("manual");
        t.setTaxDeductible(taxDeductible);
        t.setWithholdingApplicable(withholdingApplicable);
        t.setTransactionDate(transactionDate);

        BigDecimal whtAmount = BigDecimal.ZERO;

        String whtRateStr = null;

        if (withholdingApplicable) {
            BigDecimal rate = getWhtRate(category);
            if (rate != null) {
                whtAmount = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
                whtRateStr = toPercent(rate);
            }
        }

        t.setWithholdingAmount(whtAmount);

        transactionRepository.save(t);
        updateIncomeTaxCalculation(user);
        auditLogService.log(user, "TRANSACTION_CREATED",
            "Transaction " + t.getTransactionId() + " created. Type: " + type
                + ", Amount: " + amount + ", Category: " + category, null);

        Map<String, Object> whtInfo = new LinkedHashMap<>();
        whtInfo.put("applicable", withholdingApplicable);
        whtInfo.put("rate", whtRateStr);
        whtInfo.put("amount", whtAmount);
        whtInfo.put("message", null);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("transaction_id", t.getTransactionId());
        result.put("type", t.getType());
        result.put("amount", t.getAmount());
        result.put("category", t.getCategory());
        result.put("entry_method", t.getEntryMethod());
        result.put("tax_deductible", t.getTaxDeductible());
        result.put("withholding", whtInfo);
        result.put("transaction_date", t.getTransactionDate());

        result.put("tax_liability_updated", true);

        if (type.equals("income")) {
            BigDecimal suggested = amount.multiply(VAULT_SUGGESTION_RATE).setScale(2, RoundingMode.HALF_UP);
            Map<String, Object> vault = new LinkedHashMap<>();
            vault.put("suggested", true);
            vault.put("suggested_amount", suggested);
            vault.put("message", "Consider saving GHS " + suggested + " for taxes on this income");
            result.put("vault_suggestion", vault);
        }

        return result;
    }

    // --- Internal: called by InvoiceService when an invoice is marked paid ---

    @Transactional
    public Transaction createInvoiceTransaction(User user, BigDecimal amount,
            String description, LocalDate transactionDate) {
        Transaction t = new Transaction();
        t.setUser(user);
        t.setType("income");
        t.setAmount(amount);
        t.setCategory("invoice_payment");
        t.setDescription(description);
        t.setEntryMethod("invoice");
        t.setTaxDeductible(false);
        t.setWithholdingApplicable(false);
        t.setWithholdingAmount(BigDecimal.ZERO);
        t.setTransactionDate(transactionDate);
        transactionRepository.save(t);
        updateIncomeTaxCalculation(user);
        return t;
    }

    public Map<String, Object> getTransaction(User user, UUID id) {
        Transaction t = findOwned(user, id);
        return toDetail(t);
    }


    @Transactional
    public Map<String, Object> updateTransaction(User user, UUID id, Map<String, Object> body) {
        Transaction t = findOwned(user, id);

        if ("invoice".equals(t.getEntryMethod())) {
            throw new BadRequestException("Transactions created from invoices cannot be edited directly");
        }

        String oldValues = "Amount: " + t.getAmount() + ", Category: " + t.getCategory()
            + ", Date: " + t.getTransactionDate();

        if (body.containsKey("amount")) {
            t.setAmount(requirePositiveDecimal(body, "amount"));
        }
        if (body.containsKey("category")) {
            t.setCategory((String) body.get("category"));
        }
        if (body.containsKey("description")) {
            t.setDescription((String) body.get("description"));
        }
        if (body.containsKey("tax_deductible")) {
            t.setTaxDeductible(boolOrFalse(body, "tax_deductible"));
        }
        if (body.containsKey("withholding_applicable")) {
            t.setWithholdingApplicable(boolOrFalse(body, "withholding_applicable"));
        }
        if (body.containsKey("transaction_date")) {
            LocalDate d = requireDate(body, "transaction_date");
            if (d.isAfter(LocalDate.now())) {
                throw new BadRequestException("Transaction date cannot be in the future");
            }

            t.setTransactionDate(d);
        }

        BigDecimal whtAmount = BigDecimal.ZERO;

        String whtRateStr = null;

        if (Boolean.TRUE.equals(t.getWithholdingApplicable())) {
            BigDecimal rate = getWhtRate(t.getCategory());
            if (rate != null) {
                whtAmount = t.getAmount().multiply(rate).setScale(2, RoundingMode.HALF_UP);
                whtRateStr = toPercent(rate);
            }
        }
        t.setWithholdingAmount(whtAmount);

        transactionRepository.save(t);
        updateIncomeTaxCalculation(user);
        auditLogService.log(user, "TRANSACTION_UPDATED",
            "Transaction " + id + " updated. Before: [" + oldValues + "] After: [Amount: "
                + t.getAmount() + ", Category: " + t.getCategory() + ", Date: " + t.getTransactionDate() + "]", null);

        Map<String, Object> whtInfo = new LinkedHashMap<>();
        whtInfo.put("applicable", t.getWithholdingApplicable());
        whtInfo.put("rate", whtRateStr);
        whtInfo.put("amount", whtAmount);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("transaction_id", t.getTransactionId());
        result.put("amount", t.getAmount());
        result.put("category", t.getCategory());
        result.put("tax_deductible", t.getTaxDeductible());
        result.put("withholding", whtInfo);
        result.put("transaction_date", t.getTransactionDate());
        result.put("updated_at", t.getUpdatedAt());
        result.put("tax_liability_updated", true);
        return result;
    }


    @Transactional
    public void deleteTransaction(User user, UUID id) {
        Transaction t = findOwned(user, id);

        if ("invoice".equals(t.getEntryMethod())) {
            throw new ForbiddenException("Transactions created from invoices cannot be deleted directly");
        }

        auditLogService.log(user, "TRANSACTION_DELETED",
            "Transaction " + id + " deleted. Amount: " + t.getAmount() + ", Category: " + t.getCategory(),
            null);

        transactionRepository.delete(t);
        updateIncomeTaxCalculation(user);
    }


    @Transactional
    public Map<String, Object> importStatement(User user, MultipartFile file,
            String provider, LocalDate statementFrom, LocalDate statementTo) {
        validateFile(file);

        if (importHistoryRepository
                .existsByUserAndProviderAndStatementFromLessThanEqualAndStatementToGreaterThanEqual(
                    user, provider, statementTo, statementFrom)) {
            throw new ConflictException("Transactions for this period have already been imported");
        }

        List<ParsedRow> rows = parseCsv(file);

        List<Transaction> saved = new ArrayList<>();

        List<Map<String, Object>> ambiguous = new ArrayList<>();

        int skipped = 0;

        for (ParsedRow row : rows) {
            if (row.date == null || row.amount == null
                    || row.amount.compareTo(BigDecimal.ZERO) == 0
                    || row.date.isBefore(statementFrom)
                    || row.date.isAfter(statementTo)) {
                skipped++;
                continue;
            }

            Transaction t = new Transaction();
            t.setUser(user);
            t.setAmount(row.amount);
            t.setType(row.type);
            t.setCategory(row.suggestedCategory);
            t.setDescription(row.description);
            t.setEntryMethod("import");
            t.setTaxDeductible(false);
            t.setWithholdingApplicable(false);
            t.setWithholdingAmount(BigDecimal.ZERO);
            t.setTransactionDate(row.date);
            transactionRepository.save(t);
            saved.add(t);

            if (row.needsReview) {
                Map<String, Object> a = new LinkedHashMap<>();
                a.put("transaction_id", t.getTransactionId());
                a.put("amount", t.getAmount());
                a.put("description", t.getDescription());
                a.put("suggested_category", t.getCategory());
                a.put("transaction_date", t.getTransactionDate());
                a.put("needs_review", true);
                ambiguous.add(a);
            }
        }

        ImportHistory history = new ImportHistory();
        history.setUser(user);
        history.setProvider(provider);
        history.setStatementFrom(statementFrom);
        history.setStatementTo(statementTo);
        history.setTotalImported(saved.size());
        history.setTotalSkipped(skipped);
        importHistoryRepository.save(history);

        updateIncomeTaxCalculation(user);
        auditLogService.log(user, "STATEMENT_IMPORTED",
            "Statement imported from " + provider + " (" + statementFrom + " to " + statementTo
                + "). Imported: " + saved.size() + ", Skipped: " + skipped, null);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("import_id", history.getImportId());
        result.put("provider", provider);
        result.put("statement_from", statementFrom);
        result.put("statement_to", statementTo);
        result.put("total_transactions_found", rows.size());
        result.put("transactions_imported", saved.size());
        result.put("transactions_skipped", skipped);
        result.put("ambiguous_transactions", ambiguous);
        result.put("tax_liability_updated", true);
        return result;
    }


    public Map<String, Object> getImportHistory(User user) {

        List<ImportHistory> imports = importHistoryRepository.findAllByUserOrderByImportedAtDesc(user);

        List<Map<String, Object>> list = imports.stream().map(h -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("import_id", h.getImportId());
            m.put("provider", h.getProvider());
            m.put("statement_from", h.getStatementFrom());
            m.put("statement_to", h.getStatementTo());
            m.put("total_imported", h.getTotalImported());
            m.put("imported_at", h.getImportedAt());
            return m;
        }).toList();

        return Map.of("imports", list, "total", list.size());
    }

   
    public Map<String, Object> validateImport(User user, MultipartFile file, String provider) {
        validateFile(file);


        List<ParsedRow> rows = parseCsv(file);

        List<ParsedRow> valid = rows.stream()
            .filter(r -> r.date != null && r.amount != null && r.amount.compareTo(BigDecimal.ZERO) != 0)
            .toList();

        LocalDate detectedFrom = valid.stream().map(r -> r.date).min(LocalDate::compareTo).orElse(null);

        LocalDate detectedTo   = valid.stream().map(r -> r.date).max(LocalDate::compareTo).orElse(null);

        boolean overlap = detectedFrom != null && detectedTo != null
            && importHistoryRepository
                .existsByUserAndProviderAndStatementFromLessThanEqualAndStatementToGreaterThanEqual(
                user, provider, detectedTo, detectedFrom);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("detected_from", detectedFrom);
        result.put("detected_to", detectedTo);
        result.put("total_transactions_detected", valid.size());
        result.put("overlap_detected", overlap);
        result.put("overlapping_periods", List.of());
        result.put("safe_to_import", !overlap);
        return result;
    }


    
    private void updateIncomeTaxCalculation(User user) {
        int year = LocalDate.now().getYear();
        LocalDate start = LocalDate.of(year, 1, 1);

        LocalDate end   = LocalDate.of(year, 12, 31);

        BigDecimal grossIncome = Optional.ofNullable(
            transactionRepository.sumAmountByUserAndTypeAndDateRange(user, "income", start, end))
            .orElse(BigDecimal.ZERO);

        BigDecimal totalDeductions = Optional.ofNullable(
            transactionRepository.sumDeductibleExpensesByUserAndDateRange(user, start, end))
            .orElse(BigDecimal.ZERO);

        BigDecimal taxableIncome = grossIncome.subtract(totalDeductions).max(BigDecimal.ZERO);

        BigDecimal liability = taxEngine.calculateIncomeTax(taxableIncome);

        TaxCalculation calc = taxCalculationRepository
            .findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(user, "income_tax", start, end)
            .orElseGet(() -> {
                TaxCalculation c = new TaxCalculation();
                c.setUser(user);
                c.setTaxType("income_tax");
                c.setPeriodStart(start);
                c.setPeriodEnd(end);
                return c;
            });
            
            calc.setGrossIncome(grossIncome);
            calc.setTotalDeductions(totalDeductions);
            calc.setTaxableIncome(taxableIncome);

        calc.setTaxLiability(liability);
        taxCalculationRepository.save(calc);
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds the 10MB limit");
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        if (!filename.endsWith(".csv")) {
            throw new BadRequestException("Only CSV files are supported at this time");
        }
    }

    private List<ParsedRow> parseCsv(MultipartFile file) {
        List<ParsedRow> rows = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String header = reader.readLine();

            if (header == null){
                return rows;
            }

            String[] cols = header.toLowerCase().split(",");

            int dateIdx = -1, descIdx = -1, amountIdx = -1, typeIdx = -1, debitIdx = -1, creditIdx = -1;
            
            for (int i = 0; i < cols.length; i++) {
                switch (cols[i].trim()) {
                    case "date"                                -> dateIdx   = i;
                    case "description", "narration", "details" -> descIdx  = i;
                    case "amount"                              -> amountIdx = i;
                    case "type", "transaction type"            -> typeIdx   = i;
                    case "debit"                               -> debitIdx  = i;
                    case "credit"                              -> creditIdx = i;
                }
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()){
                    continue;
                }

                String[] parts = line.split(",", -1);

                ParsedRow row = new ParsedRow();

                if (dateIdx >= 0 && dateIdx < parts.length) {
                    row.date = parseDate(parts[dateIdx].trim());
                }

                if (descIdx >= 0 && descIdx < parts.length) {
                    row.description = parts[descIdx].trim();
                }

                if (debitIdx >= 0 && creditIdx >= 0) {
                    BigDecimal debit  = debitIdx  < parts.length ? parseBd(parts[debitIdx].trim())  : BigDecimal.ZERO;

                    BigDecimal credit = creditIdx < parts.length ? parseBd(parts[creditIdx].trim()) : BigDecimal.ZERO;

                    if (credit.compareTo(BigDecimal.ZERO) > 0) {
                        row.amount = credit;
                        row.type   = "income";
                    } else if (debit.compareTo(BigDecimal.ZERO) > 0) {
                        row.amount = debit;
                        row.type   = "expense";
                    }
                } else if (amountIdx >= 0 && amountIdx < parts.length) {

                    row.amount = parseBd(parts[amountIdx].trim());

                    if (typeIdx >= 0 && typeIdx < parts.length) {
                        String tp = parts[typeIdx].trim().toLowerCase();


                        row.type = (tp.contains("credit") || tp.contains("income")) ? "income" : "expense";
                    } else {
                        row.type = "income";
                    }
                }

                if (row.type != null) {
                    row.suggestedCategory = row.type.equals("income") ? "other_income" : "general_expense";
                    row.needsReview = isAmbiguous(row.description);
                }

                rows.add(row);
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("The file could not be parsed");
        }

        return rows;
    }

    private boolean isAmbiguous(String description) {
        if (description == null){
            return false; 
        }

        String lower = description.toLowerCase();

        return AMBIGUOUS_KEYWORDS.stream().anyMatch(lower::contains);
    }

    private LocalDate parseDate(String s) {
        for (DateTimeFormatter fmt : List.of(
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"))) {
            try{
                return LocalDate.parse(s, fmt); 
            }catch (DateTimeParseException ignored) {}
        }

        return null;
    }

    private BigDecimal parseBd(String s) {
        if (s == null || s.isBlank()) return BigDecimal.ZERO;

        try{ 
            return new BigDecimal(s.replaceAll("[^\\d.]", "")); 
        }
        catch (NumberFormatException e){
            return BigDecimal.ZERO; 
        }
    }

    private BigDecimal getWhtRate(String category) {
        if (category == null){
            return null;
        }

        return switch (category.toLowerCase()) {
            case "dividends"        -> GhanaTaxEngine.WHT_DIVIDENDS;
            case "interest"         -> GhanaTaxEngine.WHT_INTEREST;
            case "royalties"        -> GhanaTaxEngine.WHT_ROYALTIES;
            case "rent_residential" -> GhanaTaxEngine.WHT_RENT_RESIDENTIAL;
            case "rent_commercial"  -> GhanaTaxEngine.WHT_RENT_COMMERCIAL;
            case "goods"            -> GhanaTaxEngine.WHT_GOODS;
            case "works"            -> GhanaTaxEngine.WHT_WORKS;
            case "services"         -> GhanaTaxEngine.WHT_SERVICES;
            case "director_fees"    -> GhanaTaxEngine.WHT_DIRECTOR_FEES;
            default                 -> null;
        };
    }

    private String toPercent(BigDecimal rate) {
        return rate.multiply(BigDecimal.valueOf(100)).stripTrailingZeros().toPlainString() + "%";
    }

    private Map<String, Object> toSummary(Transaction t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("transaction_id", t.getTransactionId());
        m.put("type", t.getType());
        m.put("amount", t.getAmount());
        m.put("category", t.getCategory());
        m.put("description", t.getDescription());
        m.put("entry_method", t.getEntryMethod());
        m.put("receipt_url", t.getReceiptUrl());
        m.put("tax_deductible", t.getTaxDeductible());
        m.put("withholding_applicable", t.getWithholdingApplicable());
        m.put("withholding_amount", t.getWithholdingAmount());
        m.put("withholding_remitted", t.getWithholdingRemitted());
        m.put("transaction_date", t.getTransactionDate());
        m.put("created_at", t.getCreatedAt());
        return m;
    }

    private Map<String, Object> toDetail(Transaction t) {
        Map<String, Object> m = new LinkedHashMap<>(toSummary(t));

        m.put("withholding_remitted_at", t.getWithholdingRemittedAt());

        m.put("updated_at", t.getUpdatedAt());

        return m;
    }

    private String requireString(Map<String, Object> body, String key) {
        Object val = body.get(key);

        if (val == null || val.toString().isBlank()) {
            throw new BadRequestException(key + " is required");
        }

        return val.toString();
    }

    private BigDecimal requirePositiveDecimal(Map<String, Object> body, String key) {
        Object val = body.get(key);

        if (val == null){
            throw new BadRequestException(key + " is required");
        }

        BigDecimal bd;

        try{
            bd = new BigDecimal(val.toString());
        }
        catch (NumberFormatException e){
            throw new BadRequestException(key + " must be a valid number"); 
        }
        if (bd.compareTo(BigDecimal.ZERO) <= 0){
            throw new BadRequestException(key + " must be greater than 0");
        }

        return bd;
    }

    private LocalDate requireDate(Map<String, Object> body, String key) {
        Object val = body.get(key);
        if (val == null){
            throw new BadRequestException(key + " is required");
        }


        try{
            return LocalDate.parse(val.toString()); 
        }
        catch (DateTimeParseException e){
            throw new BadRequestException(key + " must be a valid date (YYYY-MM-DD)");
        }
    }

    private boolean boolOrFalse(Map<String, Object> body, String key) {
        Object val = body.get(key);
        if (val == null){
            return false;}
        
        if (val instanceof Boolean b){
            return b;
        }

        return Boolean.parseBoolean(val.toString());
    }
    
    private static class ParsedRow {
        LocalDate date;
        String description;
        BigDecimal amount;
        String type;
        String suggestedCategory;
        boolean needsReview;
    }


    private Transaction findOwned(User user, UUID id) {
        return transactionRepository.findByTransactionIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("No transaction found with this ID"));
    }

}
