package com.taxpadi.api.controller;

import java.time.LocalDate;
import java.util.UUID;

import com.taxpadi.api.dto.transaction.CreateTransactionRequest;
import com.taxpadi.api.dto.transaction.CreateTransactionResponse;
import com.taxpadi.api.dto.transaction.ImportHistoryListResponse;
import com.taxpadi.api.dto.transaction.ImportStatementResponse;
import com.taxpadi.api.dto.transaction.ScanTransactionResponse;
import com.taxpadi.api.dto.transaction.TransactionDetailResponse;
import com.taxpadi.api.dto.transaction.TransactionListResponse;
import com.taxpadi.api.dto.transaction.UpdateTransactionRequest;
import com.taxpadi.api.dto.transaction.UpdateTransactionResponse;
import com.taxpadi.api.dto.transaction.ValidateImportResponse;
import com.taxpadi.api.dto.transaction.VoiceTransactionResponse;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.TransactionService;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<TransactionListResponse>> getTransactions(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(name = "entry_method", required = false) String entryMethod,
            @RequestParam(name = "tax_deductible", required = false) Boolean taxDeductible,
            @RequestParam(name = "withholding_applicable", required = false) Boolean withholdingApplicable,
            @RequestParam(name = "date_from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(name = "date_to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            transactionService.getTransactions(user, type, category, entryMethod,
                taxDeductible, withholdingApplicable, dateFrom, dateTo, page, limit),
            "Transactions retrieved successfully."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreateTransactionResponse>> createTransaction(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody CreateTransactionRequest body) {
        User user = userDetails.getUser();
        return ResponseEntity.status(201).body(new ApiResponse<>(true,
            transactionService.createTransaction(user, body),
            "Transaction logged successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDetailResponse>> getTransaction(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            transactionService.getTransaction(user, id),
            "Transaction retrieved successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UpdateTransactionResponse>> updateTransaction(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody UpdateTransactionRequest body) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            transactionService.updateTransaction(user, id, body),
            "Transaction updated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        transactionService.deleteTransaction(user, id);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Transaction deleted successfully."));
    }

    @PostMapping("/import/validate")
    public ResponseEntity<ApiResponse<ValidateImportResponse>> validateImport(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam MultipartFile file,
            @RequestParam String provider) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            transactionService.validateImport(user, file, provider),
            "File validated successfully."));
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<ImportStatementResponse>> importStatement(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam MultipartFile file,
            @RequestParam String provider,
            @RequestParam(name = "statement_from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate statementFrom,
            @RequestParam(name = "statement_to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate statementTo) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            transactionService.importStatement(user, file, provider, statementFrom, statementTo),
            "Statement imported successfully. Please review flagged transactions."));
    }

    @GetMapping("/import/history")
    public ResponseEntity<ApiResponse<ImportHistoryListResponse>> getImportHistory(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            transactionService.getImportHistory(user),
            "Import history retrieved successfully."));
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<ScanTransactionResponse>> scanReceipt(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam("image") MultipartFile image,
            @RequestParam(name = "transaction_type", defaultValue = "expense") String transactionType) {
        User user = userDetails.getUser();
        return ResponseEntity.status(201).body(new ApiResponse<>(true,
            transactionService.scan(user, image, transactionType),
            "Receipt scanned and transaction logged successfully."));
    }

    @PostMapping("/voice")
    public ResponseEntity<ApiResponse<VoiceTransactionResponse>> voiceEntry(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "language", defaultValue = "en") String language) {
        User user = userDetails.getUser();
        return ResponseEntity.status(201).body(new ApiResponse<>(true,
            transactionService.voice(user, audio, language),
            "Voice transaction logged successfully."));
    }
}
