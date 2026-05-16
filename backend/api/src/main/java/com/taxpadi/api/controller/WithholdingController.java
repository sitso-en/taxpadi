package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.withholding.WhtRemitRequest;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.WithholdingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tax/withholding")
public class WithholdingController {

    private final WithholdingService withholdingService;

    public WithholdingController(WithholdingService withholdingService) {
        this.withholdingService = withholdingService;
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTransactions(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) Boolean remitted,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date_from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date_to,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            withholdingService.getTransactions(user, remitted, category, date_from, date_to, page, limit),
            "Withholding tax transactions retrieved successfully."));
    }

    @PutMapping("/transactions/{id}/remit")
    public ResponseEntity<ApiResponse<Map<String, Object>>> remit(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody(required = false) WhtRemitRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            withholdingService.remit(user, id, request),
            "Withholding tax marked as remitted."));
    }
}
