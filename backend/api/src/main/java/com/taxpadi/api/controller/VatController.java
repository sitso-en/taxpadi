package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.vat.*;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.VatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tax/vat")
public class VatController {

    private final VatService vatService;

    public VatController(VatService vatService) {
        this.vatService = vatService;
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<VatStatusResponse>> getStatus(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        User user = userDetails.getUser();
        VatStatusResponse data = vatService.getStatus(user, month, year);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "VAT status retrieved successfully."));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<VatRegisterResponse>> register(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @Valid @RequestBody VatRegisterRequest request) {
        User user = userDetails.getUser();
        VatRegisterResponse data = vatService.register(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, data, "VAT record created successfully."));
    }

    @PutMapping("/{year}/{month}")
    public ResponseEntity<ApiResponse<VatRegisterResponse>> update(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable int year,
            @PathVariable int month,
            @Valid @RequestBody VatRegisterRequest request) {
        User user = userDetails.getUser();
        VatRegisterResponse data = vatService.update(user, month, year, request);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "VAT record updated successfully."));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<VatRecordDto>>> getHistory(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) Integer year) {
        User user = userDetails.getUser();
        List<VatRecordDto> data = vatService.getHistory(user, year);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "VAT history retrieved successfully."));
    }
}
