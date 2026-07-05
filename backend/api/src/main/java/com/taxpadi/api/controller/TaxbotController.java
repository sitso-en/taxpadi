package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.taxbot.TaxbotAskRequest;
import com.taxpadi.api.dto.taxbot.TaxbotAskResponse;
import com.taxpadi.api.dto.taxbot.TaxbotHistoryResponse;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.TaxbotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/taxbot")
public class TaxbotController {

    private final TaxbotService taxbotService;

    public TaxbotController(TaxbotService taxbotService) {
        this.taxbotService = taxbotService;
    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<TaxbotAskResponse>> ask(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @Valid @RequestBody TaxbotAskRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxbotService.ask(user, request.getQuestion()),
            "TaxBot response generated successfully."));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<TaxbotHistoryResponse>> getHistory(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxbotService.getHistory(user, page, limit),
            "Conversation history retrieved successfully."));
    }
}
