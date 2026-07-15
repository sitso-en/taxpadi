package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.admin.*;
import com.taxpadi.api.dto.tax.TaxRatesResponse;
import com.taxpadi.api.model.SubscriptionTier;
import com.taxpadi.api.model.TaxpayerCategory;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.AdminService;
import com.taxpadi.api.service.TaxRateService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;
    private final TaxRateService taxRateService;

    public AdminController(AdminService adminService, TaxRateService taxRateService) {
        this.adminService = adminService;
        this.taxRateService = taxRateService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<AdminUserListResponse>> getUsers(
            @RequestParam(required = false) String subscription_tier,
            @RequestParam(required = false) String taxpayer_category,
            @RequestParam(required = false) Boolean is_active,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date_from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date_to,
            @RequestParam(defaultValue = "1") int page) {

        SubscriptionTier tier = subscription_tier != null ? SubscriptionTier.valueOf(subscription_tier.toUpperCase()) : null;
        TaxpayerCategory category = taxpayer_category != null ? TaxpayerCategory.valueOf(taxpayer_category.toUpperCase()) : null;
        LocalDateTime from = date_from != null ? date_from.atStartOfDay() : null;
        LocalDateTime to = date_to != null ? date_to.atTime(23, 59, 59) : null;

        return ResponseEntity.ok(new ApiResponse<>(true,
                adminService.getUsers(tier, category, is_active, from, to, page),
                "Users retrieved successfully."));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserDetail>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                adminService.getUser(id),
                "User retrieved successfully."));
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<AdminDeactivateResponse>> deactivateUser(
            @PathVariable UUID id,
            @RequestBody AdminDeactivateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                adminService.deactivateUser(id),
                "User account deactivated."));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<AdminActivateResponse>> activateUser(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                adminService.activateUser(id),
                "User account reactivated."));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<AdminRoleResponse>> changeRole(
            @PathVariable UUID id,
            @RequestBody AdminRoleRequest request,
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User adminUser = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
                adminService.changeRole(id, request.getRole(), adminUser),
                "User role updated successfully."));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(new ApiResponse<>(true,
                adminService.getStats(),
                "Platform statistics retrieved successfully."));
    }

    @GetMapping("/audit-log")
    public ResponseEntity<ApiResponse<AdminAuditLogResponse>> getAuditLog(
            @RequestParam(required = false) UUID user_id,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date_from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date_to,
            @RequestParam(defaultValue = "1") int page) {

        LocalDateTime from = date_from != null ? date_from.atStartOfDay() : null;
        LocalDateTime to = date_to != null ? date_to.atTime(23, 59, 59) : null;

        return ResponseEntity.ok(new ApiResponse<>(true,
                adminService.getAuditLog(user_id, action, from, to, page),
                "Platform audit log retrieved successfully."));
    }

    @GetMapping("/partners")
    public ResponseEntity<ApiResponse<AdminPartnersResponse>> getPartners(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                adminService.getPartners(page, limit),
                "Partners retrieved successfully."));
    }

    @PostMapping("/partners")
    public ResponseEntity<ApiResponse<CreatePartnerResponse>> createPartner(
            @Valid @RequestBody CreatePartnerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true,
                adminService.createPartner(request),
                "Partner added. Save the API key — it will not be shown again."));
    }

    @PutMapping("/partners/{id}")
    public ResponseEntity<ApiResponse<UpdatePartnerResponse>> updatePartner(
            @PathVariable UUID id,
            @RequestBody UpdatePartnerRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                adminService.updatePartner(id, request),
                "Partner updated successfully."));
    }

    @DeleteMapping("/partners/{id}")
    public ResponseEntity<ApiResponse<DeletePartnerResponse>> deletePartner(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                adminService.deletePartner(id),
                "Partner deactivated. All active offers have been expired."));
    }

    @GetMapping("/tax-rates")
    public ResponseEntity<ApiResponse<AdminTaxRatesResponse>> getTaxRates() {
        TaxRatesResponse rates = taxRateService.getRates();
        AdminTaxRatesResponse response = new AdminTaxRatesResponse();
        response.setTaxYear(rates.getTaxYear());
        response.setLastUpdated(rates.getLastUpdated());
        response.setRates(rates);
        return ResponseEntity.ok(new ApiResponse<>(true, response, "Tax rates retrieved successfully."));
    }

    @PutMapping("/tax-rates")
    public ResponseEntity<ApiResponse<AdminUpdateTaxRatesResponse>> updateTaxRates(
            @Valid @RequestBody AdminUpdateTaxRatesRequest request,
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User admin = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
                taxRateService.updateRates(request, admin.getUserId()),
                "Tax rates updated. New rates are effective immediately."));
    }

    @PostMapping("/notifications/broadcast")
    public ResponseEntity<ApiResponse<Void>> broadcast(
            @RequestBody java.util.Map<String, String> body) {
        String title = body.get("title");
        String message = body.get("message");
        if (title == null || message == null)
            throw new com.taxpadi.api.exception.BadRequestException("title and message are required");
        adminService.broadcastSystemUpdate(title, message);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "System notification sent to all users."));
    }
}
