package com.taxpadi.api.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.tax.RecalculateResponse;
import com.taxpadi.api.dto.tax.TaxLiabilityDetailResponse;
import com.taxpadi.api.dto.tax.TaxLiabilityResponse;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.TaxCalculationService;
import com.taxpadi.api.service.TaxRateService;

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
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        TaxLiabilityResponse data = taxCalculationService.getLiability(user);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Tax liability retrieved successfully."));
    }

    @GetMapping("/liability/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHistory(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) String tax_type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {
        User user = userDetails.getUser();
        Map<String, Object> data = taxCalculationService.getHistory(user, tax_type, page, limit);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Tax liability history retrieved successfully."));
    }

    @GetMapping("/liability/{taxType}")
    public ResponseEntity<ApiResponse<TaxLiabilityDetailResponse>> getLiabilityByType(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable String taxType,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        User user = userDetails.getUser();
        TaxLiabilityDetailResponse data = taxCalculationService.getLiabilityByType(user, taxType, year, month);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Tax liability breakdown retrieved successfully."));
    }

    @PostMapping("/liability/recalculate")
    public ResponseEntity<ApiResponse<RecalculateResponse>> recalculate(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        RecalculateResponse data = taxCalculationService.recalculate(user);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Tax liability recalculated successfully."));
    }

    @GetMapping("/brackets")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBrackets() {
        return ResponseEntity.ok(new ApiResponse<>(true, taxRateService.getBrackets(), "Tax brackets retrieved successfully."));
    }

    @GetMapping("/rates")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRates() {
        return ResponseEntity.ok(new ApiResponse<>(true, taxRateService.getRates(), "Tax rates retrieved successfully."));
    }
}
