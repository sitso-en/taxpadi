package com.taxpadi.controller;

import com.taxpadi.service.TaxProfileService;
import com.taxpadi.service.TaxProfileService.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tax-profile")
public class TaxProfileController {

    private final TaxProfileService taxProfileService;

    public TaxProfileController(TaxProfileService taxProfileService) {
        this.taxProfileService = taxProfileService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam String userId) {
        return ResponseEntity.ok(buildResponse(true,
                taxProfileService.getProfile(userId),
                "Tax profile retrieved successfully."));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestParam String userId,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(buildResponse(true,
                taxProfileService.updateProfile(userId, request),
                "Tax profile updated successfully."));
    }

    @PostMapping("/complete-onboarding")
    public ResponseEntity<Map<String, Object>> completeOnboarding(
            @RequestParam String userId,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(buildResponse(true,
                taxProfileService.completeOnboarding(userId, request),
                "Onboarding complete. Your tax deadlines have been generated."));
    }

    @ExceptionHandler(TaxProfileNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(TaxProfileNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError("TAX_PROFILE_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(AlreadyOnboardedException.class)
    public ResponseEntity<Map<String, Object>> handleAlreadyOnboarded(AlreadyOnboardedException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError("ALREADY_ONBOARDED", ex.getMessage()));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(ValidationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError("VALIDATION_ERROR", ex.getMessage()));
    }

    private Map<String, Object> buildResponse(boolean success, Object data, String message) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", success); r.put("data", data);
        r.put("message", message); r.put("timestamp", LocalDateTime.now());
        return r;
    }

    private Map<String, Object> buildError(String code, String message) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", false); r.put("code", code);
        r.put("message", message); r.put("timestamp", LocalDateTime.now());
        return r;
    }
