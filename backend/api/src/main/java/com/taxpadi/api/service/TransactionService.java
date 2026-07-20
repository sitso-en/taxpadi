package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import java.io.InputStreamReader;

import java.io.BufferedReader;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxpadi.api.dto.transaction.AmbiguousTransactionItem;
import com.taxpadi.api.dto.transaction.CreateTransactionRequest;
import com.taxpadi.api.dto.transaction.CreateTransactionResponse;
import com.taxpadi.api.dto.transaction.ImportHistoryItem;
import com.taxpadi.api.dto.transaction.ImportHistoryListResponse;
import com.taxpadi.api.dto.transaction.ImportStatementResponse;
import com.taxpadi.api.dto.transaction.PaginationInfo;
import com.taxpadi.api.dto.transaction.ScanTransactionResponse;
import com.taxpadi.api.dto.transaction.TransactionDetailResponse;
import com.taxpadi.api.dto.transaction.TransactionListResponse;
import com.taxpadi.api.dto.transaction.TransactionSummaryResponse;
import com.taxpadi.api.dto.transaction.UpdateTransactionRequest;
import com.taxpadi.api.dto.transaction.UpdateTransactionResponse;
import com.taxpadi.api.dto.transaction.ValidateImportResponse;
import com.taxpadi.api.dto.transaction.VaultSuggestion;
import com.taxpadi.api.dto.transaction.VoiceTransactionResponse;
import com.taxpadi.api.dto.transaction.WithholdingInfo;
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

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    private static final long MAX_AUDIO_SIZE = 25 * 1024 * 1024;
    private static final List<String> AMBIGUOUS_KEYWORDS = List.of(
        "transfer", "float", "commission", "adjustment");

    private final TransactionRepository transactionRepository;
    private final ImportHistoryRepository importHistoryRepository;
    private final TaxCalculationRepository taxCalculationRepository;
    private final GhanaTaxEngine taxEngine;
    private final AuditLogService auditLogService;
    private final CloudinaryService cloudinaryService;
    private final OcrService ocrService;
    private final SpeechService speechService;

    public TransactionService(TransactionRepository transactionRepository,
            ImportHistoryRepository importHistoryRepository,
            TaxCalculationRepository taxCalculationRepository,
            GhanaTaxEngine taxEngine,
            AuditLogService auditLogService,
            CloudinaryService cloudinaryService,
            OcrService ocrService,
            SpeechService speechService) {
        this.transactionRepository = transactionRepository;
        this.importHistoryRepository = importHistoryRepository;
        this.taxCalculationRepository = taxCalculationRepository;
        this.taxEngine = taxEngine;
        this.auditLogService = auditLogService;
        this.cloudinaryService = cloudinaryService;
        this.ocrService = ocrService;
        this.speechService = speechService;
    }


    public TransactionListResponse getTransactions(User user, String type, String category,
            String entryMethod, Boolean taxDeductible, Boolean withholdingApplicable,
            LocalDate dateFrom, LocalDate dateTo, String search, int page, int limit) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);

        Page<Transaction> results = transactionRepository.findFiltered(
            user, type, category, entryMethod, taxDeductible, withholdingApplicable,
            dateFrom, dateTo, search, PageRequest.of(safePage, safeLimit));

        PaginationInfo pagination = new PaginationInfo();
        pagination.setTotal(results.getTotalElements());
        pagination.setPage(page);
        pagination.setLimit(safeLimit);
        pagination.setTotalPages(results.getTotalPages());

        TransactionListResponse response = new TransactionListResponse();
        response.setTransactions(results.getContent().stream().map(this::toSummary).collect(Collectors.toList()));
        response.setPagination(pagination);
        return response;
    }


    @Transactional
    public CreateTransactionResponse createTransaction(User user, CreateTransactionRequest req) {
        if (req.getType() == null || req.getType().isBlank()) {
            throw new BadRequestException("type is required");
        }
        String type = req.getType();
        if (!type.equals("income") && !type.equals("expense")) {
            throw new BadRequestException("Type must be income or expense");
        }

        if (req.getAmount() == null) {
            throw new BadRequestException("amount is required");
        }
        BigDecimal amount = req.getAmount();
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("amount must be greater than 0");
        }

        if (req.getCategory() == null || req.getCategory().isBlank()) {
            throw new BadRequestException("category is required");
        }
        String category = req.getCategory();

        if (req.getTransactionDate() == null || req.getTransactionDate().isBlank()) {
            throw new BadRequestException("transaction_date is required");
        }
        LocalDate transactionDate;
        try {
            transactionDate = LocalDate.parse(req.getTransactionDate());
        } catch (DateTimeParseException e) {
            throw new BadRequestException("transaction_date must be a valid date (YYYY-MM-DD)");
        }

        if (transactionDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("Transaction date cannot be in the future");
        }

        boolean taxDeductible = req.getTaxDeductible() != null && req.getTaxDeductible();
        boolean withholdingApplicable = req.getWithholdingApplicable() != null && req.getWithholdingApplicable();
        String description = req.getDescription();

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
        updateIncomeTaxCalculationForYear(user, transactionDate.getYear());
        auditLogService.log(user, "TRANSACTION_CREATED",
            "Transaction " + t.getTransactionId() + " created. Type: " + type
                + ", Amount: " + amount + ", Category: " + category, null);

        WithholdingInfo whtInfo = new WithholdingInfo();
        whtInfo.setApplicable(withholdingApplicable);
        whtInfo.setRate(whtRateStr);
        whtInfo.setAmount(whtAmount);

        CreateTransactionResponse response = new CreateTransactionResponse();
        response.setTransactionId(t.getTransactionId());
        response.setType(t.getType());
        response.setAmount(t.getAmount());
        response.setCategory(t.getCategory());
        response.setEntryMethod(t.getEntryMethod());
        response.setTaxDeductible(t.getTaxDeductible());
        response.setWithholding(whtInfo);
        response.setTransactionDate(t.getTransactionDate());
        response.setTaxLiabilityUpdated(true);

        if (type.equals("income")) {
            int year = LocalDate.now().getYear();
            taxCalculationRepository
                .findFirstByUserAndTaxTypeAndPeriodStartAndPeriodEndOrderByCalculatedAtDesc(
                    user, "income_tax", LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31))
                .filter(c -> c.getGrossIncome() != null
                    && c.getGrossIncome().compareTo(BigDecimal.ZERO) > 0
                    && c.getTaxLiability() != null
                    && c.getTaxLiability().compareTo(BigDecimal.ZERO) > 0)
                .ifPresent(c -> {
                    BigDecimal effectiveRate = c.getTaxLiability()
                        .divide(c.getGrossIncome(), 4, RoundingMode.HALF_UP);
                    BigDecimal suggested = amount.multiply(effectiveRate).setScale(2, RoundingMode.HALF_UP);
                    VaultSuggestion vault = new VaultSuggestion();
                    vault.setSuggested(true);
                    vault.setSuggestedAmount(suggested);
                    vault.setMessage("Consider saving GHS " + suggested
                        + " (" + toPercent(effectiveRate) + " effective rate) for taxes on this income");
                    response.setVaultSuggestion(vault);
                });
        }

        return response;
    }

    @Transactional
    public ScanTransactionResponse scan(User user, MultipartFile image, String transactionType) {
        String filename = image.getOriginalFilename() != null ? image.getOriginalFilename().toLowerCase() : "";
        if (!filename.endsWith(".jpg") && !filename.endsWith(".jpeg") && !filename.endsWith(".png") && !filename.endsWith(".webp"))
            throw new BadRequestException("Only JPG, PNG, and WebP images are supported. If you have a HEIC photo (iPhone), convert it to JPG first");
        if (image.getSize() > MAX_IMAGE_SIZE)
            throw new BadRequestException("Image size exceeds the 5MB limit");
        if (!transactionType.equals("income") && !transactionType.equals("expense"))
            throw new BadRequestException("transaction_type must be income or expense");

        byte[] imageBytes;
        try { imageBytes = image.getBytes(); } catch (Exception e) {
            throw new BadRequestException("Could not read image file");
        }

        String mediaType = filename.endsWith(".png") ? "image/png"
                : filename.endsWith(".webp") ? "image/webp"
                : "image/jpeg";
        String receiptUrl = cloudinaryService.uploadFile(imageBytes, "receipts",
            "receipt-" + user.getUserId() + "-" + System.currentTimeMillis());

        OcrService.OcrResult ocr = ocrService.extractFromImage(imageBytes, mediaType);

        Transaction t = new Transaction();
        t.setUser(user);
        t.setType(transactionType);
        t.setAmount(ocr.amount);
        t.setCategory(ocr.category);
        t.setDescription(ocr.description);
        t.setEntryMethod("scan");
        t.setReceiptUrl(receiptUrl);
        t.setTaxDeductible(false);
        t.setWithholdingApplicable(false);
        t.setWithholdingAmount(BigDecimal.ZERO);
        t.setTransactionDate(ocr.transactionDate);
        transactionRepository.save(t);
        updateIncomeTaxCalculationForYear(user, t.getTransactionDate().getYear());
        auditLogService.log(user, "TRANSACTION_CREATED",
            "Scan transaction " + t.getTransactionId() + " created via OCR. Amount: " + ocr.amount, null);

        ScanTransactionResponse response = new ScanTransactionResponse();
        response.setTransactionId(t.getTransactionId());
        response.setType(t.getType());
        response.setAmount(t.getAmount());
        response.setCategory(t.getCategory());
        response.setDescription(t.getDescription());
        response.setEntryMethod("scan");
        response.setReceiptUrl(receiptUrl);
        response.setTaxDeductible(false);
        response.setTransactionDate(t.getTransactionDate());
        response.setOcrConfidence(ocr.confidence);
        response.setNeedsReview(ocr.needsReview);
        response.setTaxLiabilityUpdated(true);
        return response;
    }

    @Transactional
    public VoiceTransactionResponse voice(User user, MultipartFile audio, String language) {
        String filename = audio.getOriginalFilename() != null ? audio.getOriginalFilename().toLowerCase() : "";
        List<String> allowed = List.of(".mp3", ".wav", ".m4a", ".mp4", ".aac", ".ogg", ".opus", ".webm", ".flac", ".3gp");
        if (allowed.stream().noneMatch(filename::endsWith))
            throw new BadRequestException("Unsupported audio format. Accepted formats: MP3, WAV, M4A, MP4, AAC, OGG, OPUS, WEBM, FLAC, 3GP");
        if (audio.getSize() > MAX_AUDIO_SIZE)
            throw new BadRequestException("Audio file exceeds the 25MB limit");

        byte[] audioBytes;
        try { audioBytes = audio.getBytes(); } catch (Exception e) {
            throw new BadRequestException("Could not read audio file");
        }

        SpeechService.SpeechResult speech = speechService.transcribe(audioBytes, language);

        Transaction t = new Transaction();
        t.setUser(user);
        t.setType(speech.type);
        t.setAmount(speech.amount);
        t.setCategory(speech.category);
        t.setDescription(speech.description);
        t.setEntryMethod("voice");
        t.setTaxDeductible(false);
        t.setWithholdingApplicable(false);
        t.setWithholdingAmount(BigDecimal.ZERO);
        t.setTransactionDate(LocalDate.now());
        transactionRepository.save(t);
        updateIncomeTaxCalculationForYear(user, t.getTransactionDate().getYear());
        auditLogService.log(user, "TRANSACTION_CREATED",
            "Voice transaction " + t.getTransactionId() + " created. Transcription: " + speech.transcription, null);

        VoiceTransactionResponse response = new VoiceTransactionResponse();
        response.setTransactionId(t.getTransactionId());
        response.setType(t.getType());
        response.setAmount(t.getAmount());
        response.setCategory(t.getCategory());
        response.setDescription(t.getDescription());
        response.setEntryMethod("voice");
        response.setTranscription(speech.transcription);
        response.setTaxDeductible(false);
        response.setTransactionDate(t.getTransactionDate());
        response.setConfidence(speech.confidence);
        response.setNeedsReview(speech.needsReview);
        response.setTaxLiabilityUpdated(true);
        return response;
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

    public TransactionDetailResponse getTransaction(User user, UUID id) {
        Transaction t = findOwned(user, id);
        return toDetail(t);
    }


    @Transactional
    public UpdateTransactionResponse updateTransaction(User user, UUID id, UpdateTransactionRequest req) {
        Transaction t = findOwned(user, id);

        if ("invoice".equals(t.getEntryMethod())) {
            throw new BadRequestException("Transactions created from invoices cannot be edited directly");
        }

        String oldValues = "Amount: " + t.getAmount() + ", Category: " + t.getCategory()
            + ", Date: " + t.getTransactionDate();

        if (req.getAmount() != null) {
            if (req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("amount must be greater than 0");
            }
            t.setAmount(req.getAmount());
        }
        if (req.getCategory() != null) {
            t.setCategory(req.getCategory());
        }
        if (req.getDescription() != null) {
            t.setDescription(req.getDescription());
        }
        if (req.getTaxDeductible() != null) {
            t.setTaxDeductible(req.getTaxDeductible());
        }
        if (req.getWithholdingApplicable() != null) {
            t.setWithholdingApplicable(req.getWithholdingApplicable());
        }
        if (req.getTransactionDate() != null && !req.getTransactionDate().isBlank()) {
            LocalDate d;
            try {
                d = LocalDate.parse(req.getTransactionDate());
            } catch (DateTimeParseException e) {
                throw new BadRequestException("transaction_date must be a valid date (YYYY-MM-DD)");
            }
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
        updateIncomeTaxCalculationForYear(user, t.getTransactionDate().getYear());
        auditLogService.log(user, "TRANSACTION_UPDATED",
            "Transaction " + id + " updated. Before: [" + oldValues + "] After: [Amount: "
                + t.getAmount() + ", Category: " + t.getCategory() + ", Date: " + t.getTransactionDate() + "]", null);

        WithholdingInfo whtInfo = new WithholdingInfo();
        whtInfo.setApplicable(t.getWithholdingApplicable());
        whtInfo.setRate(whtRateStr);
        whtInfo.setAmount(whtAmount);

        UpdateTransactionResponse response = new UpdateTransactionResponse();
        response.setTransactionId(t.getTransactionId());
        response.setAmount(t.getAmount());
        response.setCategory(t.getCategory());
        response.setTaxDeductible(t.getTaxDeductible());
        response.setWithholding(whtInfo);
        response.setTransactionDate(t.getTransactionDate());
        response.setUpdatedAt(t.getUpdatedAt());
        response.setTaxLiabilityUpdated(true);
        return response;
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

        int deletedYear = t.getTransactionDate().getYear();
        t.setIsActive(false);
        transactionRepository.save(t);
        updateIncomeTaxCalculationForYear(user, deletedYear);
    }


    @Transactional
    public ImportStatementResponse importStatement(User user, MultipartFile file,
            String provider, LocalDate statementFrom, LocalDate statementTo) {
        validateFile(file);

        List<ParsedRow> rows = parseCsv(file);

        // Auto-detect the actual date range from CSV rows — do not rely on form params
        // which default to today when the user skips the Validate step.
        List<ParsedRow> validRows = rows.stream()
            .filter(r -> r.date != null && r.amount != null && r.amount.compareTo(BigDecimal.ZERO) != 0)
            .toList();

        LocalDate effectiveFrom = validRows.stream()
            .map(r -> r.date).min(LocalDate::compareTo).orElse(statementFrom);
        LocalDate effectiveTo = validRows.stream()
            .map(r -> r.date).max(LocalDate::compareTo).orElse(statementTo);

        if (effectiveFrom != null && effectiveTo != null
                && importHistoryRepository
                    .existsByUserAndProviderAndStatementFromLessThanEqualAndStatementToGreaterThanEqual(
                        user, provider, effectiveTo, effectiveFrom)) {
            throw new ConflictException("Transactions for this period have already been imported");
        }

        List<Transaction> saved = new ArrayList<>();
        List<AmbiguousTransactionItem> ambiguous = new ArrayList<>();
        int skipped = 0;

        for (ParsedRow row : rows) {
            if (row.date == null || row.amount == null
                    || row.amount.compareTo(BigDecimal.ZERO) == 0) {
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
                AmbiguousTransactionItem a = new AmbiguousTransactionItem();
                a.setTransactionId(t.getTransactionId());
                a.setAmount(t.getAmount());
                a.setDescription(t.getDescription());
                a.setSuggestedCategory(t.getCategory());
                a.setTransactionDate(t.getTransactionDate());
                a.setNeedsReview(true);
                ambiguous.add(a);
            }
        }

        ImportHistory history = new ImportHistory();
        history.setUser(user);
        history.setProvider(provider);
        history.setStatementFrom(effectiveFrom);
        history.setStatementTo(effectiveTo);
        history.setTotalImported(saved.size());
        history.setTotalSkipped(skipped);
        if (!saved.isEmpty()) {
            importHistoryRepository.save(history);
        }

        saved.stream()
            .map(tx -> tx.getTransactionDate().getYear())
            .distinct()
            .forEach(year -> updateIncomeTaxCalculationForYear(user, year));
        auditLogService.log(user, "STATEMENT_IMPORTED",
            "Statement imported from " + provider + " (" + effectiveFrom + " to " + effectiveTo
                + "). Imported: " + saved.size() + ", Skipped: " + skipped, null);

        ImportStatementResponse response = new ImportStatementResponse();
        response.setImportId(history.getImportId());
        response.setProvider(provider);
        response.setStatementFrom(effectiveFrom);
        response.setStatementTo(effectiveTo);
        response.setTotalTransactionsFound(rows.size());
        response.setTransactionsImported(saved.size());
        response.setTransactionsSkipped(skipped);
        response.setAmbiguousTransactions(ambiguous);
        response.setTaxLiabilityUpdated(true);
        return response;
    }


    public ImportHistoryListResponse getImportHistory(User user) {
        List<ImportHistory> imports = importHistoryRepository.findAllByUserOrderByImportedAtDesc(user);

        List<ImportHistoryItem> list = imports.stream().map(h -> {
            ImportHistoryItem item = new ImportHistoryItem();
            item.setImportId(h.getImportId());
            item.setProvider(h.getProvider());
            item.setStatementFrom(h.getStatementFrom());
            item.setStatementTo(h.getStatementTo());
            item.setTotalImported(h.getTotalImported());
            item.setImportedAt(h.getImportedAt());
            return item;
        }).collect(Collectors.toList());

        ImportHistoryListResponse response = new ImportHistoryListResponse();
        response.setImports(list);
        response.setTotal(list.size());
        return response;
    }

   
    public ValidateImportResponse validateImport(User user, MultipartFile file, String provider) {
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

        ValidateImportResponse response = new ValidateImportResponse();
        response.setDetectedFrom(detectedFrom);
        response.setDetectedTo(detectedTo);
        response.setTotalTransactionsDetected(valid.size());
        response.setOverlapDetected(overlap);
        response.setOverlappingPeriods(List.of());
        response.setSafeToImport(!overlap);
        return response;
    }


    private void updateIncomeTaxCalculation(User user) {
        updateIncomeTaxCalculationForYear(user, LocalDate.now().getYear());
    }

    private void updateIncomeTaxCalculationForYear(User user, int year) {
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
            .findFirstByUserAndTaxTypeAndPeriodStartAndPeriodEndOrderByCalculatedAtDesc(user, "income_tax", start, end)
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

            // Auto-detect delimiter: tab or comma
            String delimiter = header.contains("\t") ? "\t" : ",";
            String[] cols = header.toLowerCase().split(delimiter);

            int dateIdx = -1, descIdx = -1, amountIdx = -1, typeIdx = -1, debitIdx = -1, creditIdx = -1;

            for (int i = 0; i < cols.length; i++) {
                switch (cols[i].trim()) {
                    case "date", "transaction date", "value date", "post date",
                         "posting date", "date processed", "process date",
                         "processed date", "trans date", "txn date" -> dateIdx = i;
                    case "description", "narration", "details", "particulars",
                         "remarks", "transaction details", "memo", "reference",
                         "payee", "merchant", "transaction description",
                         "trans description", "narrative" -> descIdx = i;
                    case "amount", "transaction amount", "txn amount" -> amountIdx = i;
                    case "type", "transaction type", "txn type", "trans type" -> typeIdx = i;
                    case "debit", "withdrawls", "withdrawals", "withdrawal",
                         "dr", "debit amount", "payments", "charges",
                         "payment", "charge" -> debitIdx = i;
                    case "credit", "deposits", "deposit", "cr", "credit amount",
                         "credits" -> creditIdx = i;
                }
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()){
                    continue;
                }

                String[] parts = line.split(delimiter, -1);

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
        if (s == null || s.isBlank()) return null;
        // Strip leading/trailing quotes and whitespace some CSVs add
        s = s.replaceAll("^\"|\"$", "").trim();
        for (DateTimeFormatter fmt : List.of(
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ofPattern("MM-dd-yyyy"),
                DateTimeFormatter.ofPattern("dd-MMM-yy"),
                DateTimeFormatter.ofPattern("dd-MMM-yyyy"),
                DateTimeFormatter.ofPattern("dd/MMM/yyyy"),
                DateTimeFormatter.ofPattern("dd MMM yyyy"),
                DateTimeFormatter.ofPattern("MMM dd, yyyy"),
                DateTimeFormatter.ofPattern("MMM d, yyyy"),
                DateTimeFormatter.ofPattern("MMM dd yyyy"),
                DateTimeFormatter.ofPattern("d MMM yyyy"),
                DateTimeFormatter.ofPattern("d/M/yyyy"),
                DateTimeFormatter.ofPattern("d-M-yyyy"),
                DateTimeFormatter.ofPattern("yyyyMMdd"))) {
            try {
                return LocalDate.parse(s, fmt);
            } catch (DateTimeParseException ignored) {}
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

    private TransactionSummaryResponse toSummary(Transaction t) {
        TransactionSummaryResponse r = new TransactionSummaryResponse();
        r.setTransactionId(t.getTransactionId());
        r.setType(t.getType());
        r.setAmount(t.getAmount());
        r.setCategory(t.getCategory());
        r.setDescription(t.getDescription());
        r.setEntryMethod(t.getEntryMethod());
        r.setReceiptUrl(t.getReceiptUrl());
        r.setTaxDeductible(t.getTaxDeductible());
        r.setWithholdingApplicable(t.getWithholdingApplicable());
        r.setWithholdingAmount(t.getWithholdingAmount());
        r.setWithholdingRemitted(t.getWithholdingRemitted());
        r.setTransactionDate(t.getTransactionDate());
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }

    private TransactionDetailResponse toDetail(Transaction t) {
        TransactionDetailResponse r = new TransactionDetailResponse();
        r.setTransactionId(t.getTransactionId());
        r.setType(t.getType());
        r.setAmount(t.getAmount());
        r.setCategory(t.getCategory());
        r.setDescription(t.getDescription());
        r.setEntryMethod(t.getEntryMethod());
        r.setReceiptUrl(t.getReceiptUrl());
        r.setTaxDeductible(t.getTaxDeductible());
        r.setWithholdingApplicable(t.getWithholdingApplicable());
        r.setWithholdingAmount(t.getWithholdingAmount());
        r.setWithholdingRemitted(t.getWithholdingRemitted());
        r.setWithholdingRemittedAt(t.getWithholdingRemittedAt());
        r.setTransactionDate(t.getTransactionDate());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        return r;
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
