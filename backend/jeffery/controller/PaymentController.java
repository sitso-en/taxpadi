package com.taxpadi.controller;

import com.taxpadi.service.PaymentService;
import com.taxpadi.service.PaymentService.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // GET /api/v1/payments
    @GetMapping
    public ResponseEntity<Map<String, Object>> getPayments(
            @RequestParam String userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String payment_method,
            @RequestParam(required = false) String date_from,
            @RequestParam(required = false) String date_to,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(buildResponse(true,
                paymentService.getPayments(userId, status, payment_method,
                        date_from, date_to, page),
                "Payments retrieved successfully."));
    }

    // POST /api/v1/payments/initiate
    @PostMapping("/initiate")
    public ResponseEntity<Map<String, Object>> initiate(
            @RequestParam String userId,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(buildResponse(true,
                paymentService.initiate(userId, request),
                "Payment initiated. Please approve the prompt on your phone."));
    }

    // GET /api/v1/payments/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(
            @PathVariable String id,
            @RequestParam String userId) {
        return ResponseEntity.ok(buildResponse(true,
                paymentService.getPaymentById(id, userId),
                "Payment retrieved successfully."));
    }

    // POST /api/v1/payments/{id}/confirm
    @PostMapping("/{id}/confirm")
    public ResponseEntity<Map<String, Object>> confirm(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(buildResponse(true,
                paymentService.confirmPayment(id, userId, request),
                "Payment confirmed. Your compliance certificate has been generated."));
    }

    // GET /api/v1/payments/{id}/status
    @GetMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> getStatus(
            @PathVariable String id,
            @RequestParam String userId) {
        return ResponseEntity.ok(buildResponse(true,
                paymentService.getPaymentStatus(id, userId),
                "Payment status retrieved successfully."));
    }

    // GET /api/v1/payments/{id}/certificate
    @GetMapping("/{id}/certificate")
    public ResponseEntity<Map<String, Object>> getCertificate(
            @PathVariable String id,
            @RequestParam String userId) {
        return ResponseEntity.ok(buildResponse(true,
                paymentService.getCertificate(id, userId),
                "Compliance certificate retrieved successfully."));
    }

    // Exception handlers
    @ExceptionHandler(ReturnOrPenaltyRequiredException.class)
    public ResponseEntity<Map<String, Object>> handleReturnOrPenalty(ReturnOrPenaltyRequiredException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError("RETURN_OR_PENALTY_REQUIRED", ex.getMessage()));
    }

    @ExceptionHandler(AlreadyPaidException.class)
    public ResponseEntity<Map<String, Object>> handleAlreadyPaid(AlreadyPaidException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError("ALREADY_PAID", ex.getMessage()));
    }

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(PaymentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError("PAYMENT_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(CertificateNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleCertNotFound(CertificateNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError("CERTIFICATE_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(PaymentNotPendingException.class)
    public ResponseEntity<Map<String, Object>> handleNotPending(PaymentNotPendingException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError("PAYMENT_NOT_PENDING", ex.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(ForbiddenException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError("FORBIDDEN", ex.getMessage()));
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
}