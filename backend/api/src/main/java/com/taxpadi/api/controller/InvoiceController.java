package com.taxpadi.api.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.model.Invoice;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.InvoiceService;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInvoices(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.getInvoices(user, page, limit, status),
            "Invoices retrieved successfully."));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.getStats(user),
            "Invoice statistics retrieved successfully."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.create(user, body),
            "Invoice created successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInvoice(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.getInvoice(user, id),
            "Invoice retrieved successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.update(user, id, body),
            "Invoice updated successfully."));
    }

    @PutMapping("/{id}/paid")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markPaid(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> body) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.markPaid(user, id, body != null ? body : Map.of()),
            "Invoice marked as paid. Income has been logged automatically."));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cancel(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> body) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.cancel(user, id, body),
            "Invoice cancelled successfully."));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPdfUrl(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.getPdfUrl(user, id),
            "Invoice PDF URL generated successfully."));
    }

    @GetMapping("/{id}/pdf/download")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID id) {
        Invoice invoice = invoiceService.getInvoiceForDownload(id);
        byte[] pdf = invoiceService.downloadPdfPublic(id);
        String filename = invoice.getInvoiceRef() + ".pdf";
        return ResponseEntity.ok()
            .header("Content-Type", "application/pdf")
            .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
            .body(pdf);
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<ApiResponse<Map<String, Object>>> send(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.send(user, id, (String) body.get("channel")),
            "Invoice sent successfully."));
    }
}
