package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.tax.*;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.TaxCalculationService;
import com.taxpadi.api.service.TaxRateService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/tax")
public class TaxCalculationController {

    private final TaxCalculationService taxCalculationService;
    private final TaxRateService taxRateService;

    public TaxCalculationController(TaxCalculationService taxCalculationService, TaxRateService taxRateService) {
        this.taxCalculationService = taxCalculationService;
        this.taxRateService = taxRateService;
    }

    @GetMapping("/liability")
    public ResponseEntity<ApiResponse<TaxLiabilityResponse>> getLiability(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxCalculationService.getLiability(user, from, to),
            "Tax liability retrieved successfully."));
    }

    @GetMapping("/liability/history")
    public ResponseEntity<ApiResponse<TaxHistoryResponse>> getHistory(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) String tax_type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxCalculationService.getHistory(user, tax_type, page, limit),
            "Tax liability history retrieved successfully."));
    }

    @GetMapping("/liability/{taxType}")
    public ResponseEntity<ApiResponse<TaxLiabilityDetailResponse>> getLiabilityByType(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable String taxType,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxCalculationService.getLiabilityByType(user, taxType, year, month),
            "Tax liability breakdown retrieved successfully."));
    }

    @PostMapping("/liability/recalculate")
    public ResponseEntity<ApiResponse<RecalculateResponse>> recalculate(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxCalculationService.recalculate(user),
            "Tax liability recalculated successfully."));
    }

    @GetMapping("/brackets")
    public ResponseEntity<ApiResponse<TaxBracketsResponse>> getBrackets() {
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxRateService.getBrackets(),
            "Tax brackets retrieved successfully."));
    }

    @GetMapping("/rates")
    public ResponseEntity<ApiResponse<TaxRatesResponse>> getRates() {
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxRateService.getRates(),
            "Tax rates retrieved successfully."));
    }
}
