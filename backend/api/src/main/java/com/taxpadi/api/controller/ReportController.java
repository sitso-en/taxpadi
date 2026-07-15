package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.report.ExportResponse;
import com.taxpadi.api.dto.report.IncomeStatementResponse;
import com.taxpadi.api.dto.report.ReportTaxHistoryResponse;
import com.taxpadi.api.dto.report.SummaryResponse;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<SummaryResponse>> getSummary(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) String period,
            @RequestParam(name = "date_from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(name = "date_to",   required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            reportService.getSummary(user, period, dateFrom, dateTo),
            "Financial summary retrieved successfully."));
    }

    private static final Set<String> ASYNC_FORMATS = Set.of("pdf", "excel");

    @GetMapping("/export")
    public ResponseEntity<ApiResponse<ExportResponse>> exportData(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam String format,
            @RequestParam(name = "date_from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(name = "date_to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(name = "include_transactions", defaultValue = "true")  boolean includeTransactions,
            @RequestParam(name = "include_tax_returns",  defaultValue = "true")  boolean includeTaxReturns) {
        User user = userDetails.getUser();
        ExportResponse export = reportService.exportData(user, format, dateFrom, dateTo, includeTransactions, includeTaxReturns);
        HttpStatus status = ASYNC_FORMATS.contains(format) ? HttpStatus.ACCEPTED : HttpStatus.OK;
        return ResponseEntity.status(status)
                .body(new ApiResponse<>(true, export, "Export generated successfully."));
    }

    @GetMapping("/export/status/{jobId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> getExportStatus(
            @PathVariable String jobId) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                reportService.getExportStatus(jobId), "Export status retrieved."));
    }

    @GetMapping("/income-statement")
    public ResponseEntity<ApiResponse<IncomeStatementResponse>> getIncomeStatement(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "6") int months) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            reportService.getIncomeStatement(user, months),
            "Income statement generated successfully."));
    }

    @GetMapping("/tax-history")
    public ResponseEntity<ApiResponse<ReportTaxHistoryResponse>> getTaxHistory(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(name = "year_from", required = false) Integer yearFrom,
            @RequestParam(name = "year_to",   required = false) Integer yearTo) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            reportService.getTaxHistory(user, yearFrom, yearTo),
            "Tax history retrieved successfully."));
    }
}
