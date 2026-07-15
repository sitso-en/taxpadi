package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.certificate.CertificateDetailDto;
import com.taxpadi.api.dto.certificate.CertificateDownloadDto;
import com.taxpadi.api.dto.certificate.CertificateListResponse;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.ComplianceCertificateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/certificates")
public class ComplianceCertificateController {

    private final ComplianceCertificateService service;

    public ComplianceCertificateController(ComplianceCertificateService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CertificateListResponse>> getCertificates(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        CertificateListResponse data = service.getCertificates(user, page, Math.min(limit, 100));
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Compliance certificates retrieved successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CertificateDetailDto>> getCertificate(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        CertificateDetailDto data = service.getCertificate(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Compliance certificate retrieved successfully."));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ApiResponse<CertificateDownloadDto>> getDownloadUrl(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        CertificateDownloadDto data = service.getDownloadUrl(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Certificate download URL generated successfully."));
    }
}
