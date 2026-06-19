package com.taxpadi.api.service;

import com.taxpadi.api.dto.certificate.*;
import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.ComplianceCertificate;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.ComplianceCertificateRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplianceCertificateService {

    private final ComplianceCertificateRepository repo;

    public ComplianceCertificateService(ComplianceCertificateRepository repo) {
        this.repo = repo;
    }

    public CertificateListResponse getCertificates(User user, int page, int limit) {
        List<ComplianceCertificate> all = repo.findByUser(user);
        long total = all.size();
        int fromIdx = Math.min((page - 1) * limit, (int) total);
        int toIdx = Math.min(fromIdx + limit, (int) total);
        List<CertificateListItem> items = all.subList(fromIdx, toIdx).stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
        int totalPages = (int) Math.ceil((double) total / limit);
        return new CertificateListResponse(items, new PaginationInfo(total, page, limit, totalPages));
    }

    public CertificateDetailDto getCertificate(UUID certificateId, User user) {
        ComplianceCertificate c = repo.findById(certificateId)
                .orElseThrow(() -> new NotFoundException("No certificate found with this ID."));
        if (!c.getUser().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException("You do not have access to this certificate.");
        }
        return toDetailDto(c, user);
    }

    public CertificateDownloadDto getDownloadUrl(UUID certificateId, User user) {
        ComplianceCertificate c = repo.findById(certificateId)
                .orElseThrow(() -> new NotFoundException("No certificate found with this ID."));
        if (!c.getUser().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException("You do not have access to this certificate.");
        }
        // In production, generate a pre-signed S3 URL here
        String pdfUrl = c.getDownloadUrl() != null ? c.getDownloadUrl()
                : "/api/v1/certificates/" + certificateId + "/file";

        CertificateDownloadDto dto = new CertificateDownloadDto();
        dto.setCertificateId(c.getCertificateId());
        dto.setDocumentRef(c.getCertificateNumber());
        dto.setPdfUrl(pdfUrl);
        dto.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        return dto;
    }

    private CertificateListItem toListItem(ComplianceCertificate c) {
        CertificateListItem item = new CertificateListItem();
        item.setCertificateId(c.getCertificateId());
        item.setDocumentRef(c.getCertificateNumber());
        item.setTaxType(c.getCertificateType());
        item.setIssuedAt(c.getIssuedAt());
        return item;
    }

    private CertificateDetailDto toDetailDto(ComplianceCertificate c, User user) {
        CertificateDetailDto dto = new CertificateDetailDto();
        dto.setCertificateId(c.getCertificateId());
        dto.setDocumentRef(c.getCertificateNumber());
        dto.setTaxType(c.getCertificateType());
        dto.setPaymentReference(c.getRemarks());
        dto.setIssuedAt(c.getIssuedAt());
        dto.setTaxpayer(new TaxpayerInfo(user.getFullName(), c.getTinNumber(), user.getPhone()));
        return dto;
    }
}
