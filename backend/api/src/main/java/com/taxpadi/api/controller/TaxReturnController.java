package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.taxreturn.*;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.TaxReturnService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tax/returns")
public class TaxReturnController {

    private final TaxReturnService taxReturnService;

    public TaxReturnController(TaxReturnService taxReturnService) {
        this.taxReturnService = taxReturnService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<TaxReturnListResponse>> getReturns(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) String tax_type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxReturnService.getReturns(user, tax_type, status, year, page, limit),
            "Tax returns retrieved successfully."));
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<GenerateReturnResponse>> generate(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @Valid @RequestBody GenerateReturnRequest request,
            HttpServletRequest httpRequest) {
        User user = userDetails.getUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true,
            taxReturnService.generate(user, request, httpRequest.getRemoteAddr()),
            "Tax return generated. Please review before submitting."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxReturnDetailResponse>> getReturn(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxReturnService.getReturn(user, id),
            "Tax return retrieved successfully."));
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<ApiResponse<PreviewResponse>> preview(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxReturnService.preview(user, id),
            "Tax return preview generated."));
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<SubmitReturnResponse>> submit(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody(required = false) SubmitReturnRequest request,
            HttpServletRequest httpRequest) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxReturnService.submit(user, id, request, httpRequest.getRemoteAddr()),
            "Tax return marked as submitted."));
    }

    @PutMapping("/{id}/amend")
    public ResponseEntity<ApiResponse<AmendReturnResponse>> amend(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody AmendReturnRequest request,
            HttpServletRequest httpRequest) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxReturnService.amend(user, id, request, httpRequest.getRemoteAddr()),
            "Tax return reset to draft. Please correct the figures and resubmit."));
    }
}
