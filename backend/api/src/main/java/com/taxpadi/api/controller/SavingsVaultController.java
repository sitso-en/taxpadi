package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.vault.*;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.SavingsVaultService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vault")
public class SavingsVaultController {

    private final SavingsVaultService service;

    public SavingsVaultController(SavingsVaultService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<VaultDto>> getVault(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        VaultDto data = service.getVault(user);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Vault retrieved successfully."));
    }

    @PutMapping("/link")
    public ResponseEntity<ApiResponse<LinkMomoResponse>> linkMomo(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @Valid @RequestBody LinkMomoRequest request) {
        User user = userDetails.getUser();
        LinkMomoResponse data = service.linkMomo(user, request);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "MoMo number linked to your vault successfully."));
    }

    @PostMapping("/contribute")
    public ResponseEntity<ApiResponse<ContributeResponse>> contribute(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @Valid @RequestBody ContributeRequest request) {
        User user = userDetails.getUser();
        ContributeResponse data = service.contribute(user, request);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Vault contribution initiated."));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<VaultTransactionsResponse>> getTransactions(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        VaultTransactionsResponse data = service.getTransactions(user, page, Math.min(limit, 100));
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Vault transactions retrieved successfully."));
    }

    @GetMapping("/suggestion")
    public ResponseEntity<ApiResponse<VaultSuggestionDto>> getSuggestion(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        VaultSuggestionDto data = service.getSuggestion(user);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Vault suggestion retrieved successfully."));
    }
}
