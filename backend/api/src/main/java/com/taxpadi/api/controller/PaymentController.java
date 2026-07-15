package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.payment.ConfirmPaymentRequest;
import com.taxpadi.api.dto.payment.ConfirmPaymentResponse;
import com.taxpadi.api.dto.payment.InitiatePaymentRequest;
import com.taxpadi.api.dto.payment.InitiatePaymentResponse;
import com.taxpadi.api.dto.payment.PaymentCertificateResponse;
import com.taxpadi.api.dto.payment.PaymentDetailDto;
import com.taxpadi.api.dto.payment.PaymentListResponse;
import com.taxpadi.api.dto.payment.PaymentStatusDto;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaymentListResponse>> getPayments(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) String status,
            @RequestParam(name = "payment_method", required = false) String paymentMethod,
            @RequestParam(name = "date_from", required = false) String dateFrom,
            @RequestParam(name = "date_to", required = false) String dateTo,
            @RequestParam(defaultValue = "1") int page) {
        User user = userDetails.getUser();
        PaymentListResponse data = paymentService.getPayments(user, status, paymentMethod, dateFrom, dateTo, page);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Payments retrieved successfully."));
    }

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<InitiatePaymentResponse>> initiate(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @Valid @RequestBody InitiatePaymentRequest request) {
        User user = userDetails.getUser();
        InitiatePaymentResponse data = paymentService.initiate(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, data,
                "Payment initiated. Please approve the prompt on your phone."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentDetailDto>> getById(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        PaymentDetailDto data = paymentService.getPaymentById(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Payment retrieved successfully."));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<ConfirmPaymentResponse>> confirm(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody ConfirmPaymentRequest request) {
        User user = userDetails.getUser();
        ConfirmPaymentResponse data = paymentService.confirmPayment(id, user, request);
        return ResponseEntity.ok(new ApiResponse<>(true, data,
                "Payment confirmed. Your compliance certificate has been generated."));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PaymentStatusDto>> getStatus(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        PaymentStatusDto data = paymentService.getPaymentStatus(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Payment status retrieved successfully."));
    }

    @GetMapping("/{id}/certificate")
    public ResponseEntity<ApiResponse<PaymentCertificateResponse>> getCertificate(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        PaymentCertificateResponse data = paymentService.getCertificate(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Compliance certificate retrieved successfully."));
    }

    @PostMapping("/webhook/paystack")
    public ResponseEntity<Void> paystackWebhook(
            @RequestHeader("X-Paystack-Signature") String signature,
            @RequestBody String payload) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}
