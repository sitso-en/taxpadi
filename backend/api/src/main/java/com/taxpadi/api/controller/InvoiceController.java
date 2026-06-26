package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.invoice.*;
import com.taxpadi.api.model.Invoice;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.InvoiceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<InvoiceListResponse>> getInvoices(
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
    public ResponseEntity<ApiResponse<InvoiceStatsResponse>> getStats(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.getStats(user),
            "Invoice statistics retrieved successfully."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreateInvoiceResponse>> create(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody CreateInvoiceRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.create(user, request),
            "Invoice created successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceDetailDto>> getInvoice(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.getInvoice(user, id),
            "Invoice retrieved successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UpdateInvoiceResponse>> update(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody UpdateInvoiceRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.update(user, id, request),
            "Invoice updated successfully."));
    }

    @PutMapping("/{id}/paid")
    public ResponseEntity<ApiResponse<MarkPaidResponse>> markPaid(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody(required = false) MarkPaidRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.markPaid(user, id, request),
            "Invoice marked as paid. Income has been logged automatically."));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<CancelInvoiceResponse>> cancel(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody(required = false) CancelInvoiceRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.cancel(user, id, request),
            "Invoice cancelled successfully."));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<ApiResponse<PdfUrlResponse>> getPdfUrl(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.getPdfUrl(user, id),
            "Invoice PDF URL generated successfully."));
    }

    @GetMapping("/{id}/pdf/download")
    public ResponseEntity<Void> downloadPdf(@PathVariable UUID id) {
        Invoice invoice = invoiceService.getInvoiceForDownload(id);
        String pdfUrl = invoice.getPdfUrl();
        if (pdfUrl == null || pdfUrl.isBlank()) {
            throw new RuntimeException("PDF_NOT_AVAILABLE");
        }
        return ResponseEntity.status(HttpStatus.FOUND)
            .header("Location", pdfUrl)
            .build();
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<ApiResponse<SendInvoiceResponse>> send(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody SendInvoiceRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            invoiceService.send(user, id, request.getChannel()),
            "Invoice sent successfully."));
    }
}
