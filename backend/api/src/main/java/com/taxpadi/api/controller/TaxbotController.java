package com.taxpadi.api.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.TaxbotService;

@RestController
@RequestMapping("/api/v1/taxbot")
public class TaxbotController {

    private final TaxbotService taxbotService;

    public TaxbotController(TaxbotService taxbotService) {
        this.taxbotService = taxbotService;
    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<Map<String, Object>>> ask(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxbotService.ask(user, body.get("question")),
            "TaxBot response generated successfully."));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHistory(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            taxbotService.getHistory(user, page, limit),
            "Conversation history retrieved successfully."));
    }
}
