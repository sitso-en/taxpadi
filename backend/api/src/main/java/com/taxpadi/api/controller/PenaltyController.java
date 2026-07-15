package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.penalty.*;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.PenaltyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/penalties")
public class PenaltyController {

    private final PenaltyService service;

    public PenaltyController(PenaltyService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PenaltyListResponse>> getPenalties(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        PenaltyListResponse data = service.getPenalties(user, page, Math.min(limit, 100));
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Penalties retrieved successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PenaltyDetailDto>> getPenalty(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        PenaltyDetailDto data = service.getPenalty(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Penalty retrieved successfully."));
    }

    @GetMapping("/preview/{taxType}")
    public ResponseEntity<ApiResponse<PenaltyPreviewDto>> preview(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable String taxType) {
        User user = userDetails.getUser();
        PenaltyPreviewDto data = service.preview(taxType, user);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Penalty preview calculated successfully."));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<ResolvePenaltyResponse>> resolve(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody(required = false) ResolvePenaltyRequest request) {
        User user = userDetails.getUser();
        if (request == null) request = new ResolvePenaltyRequest();
        ResolvePenaltyResponse data = service.resolve(id, user, request);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Penalty marked as resolved."));
    }
}
