package com.taxpadi.service;
import com.taxpadi.entity.ComplianceCertificate;
import com.taxpadi.repository.ComplianceCertificateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ComplianceCertificateService {
    private final ComplianceCertificateRepository repo;
    public ComplianceCertificateService(ComplianceCertificateRepository repo) { this.repo = repo; }

    public List<ComplianceCertificate> getUserCertificates(Long userId) { return repo.findByUserId(userId); }

    public ComplianceCertificate getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Certificate not found"));
    }

    @Transactional
    public ComplianceCertificate request(Long userId, Map<String,Object> req) {
        String type = (String) req.get("certificateType");
        if (repo.existsByUserIdAndCertificateTypeAndStatus(userId, type, "PENDING"))
            throw new RuntimeException("Pending request already exists for this certificate type");
        ComplianceCertificate c = new ComplianceCertificate();
        c.setUserId(userId);
        c.setCertificateNumber("CERT-" + UUID.randomUUID().toString().substring(0,10).toUpperCase());
        c.setCertificateType(type);
        c.setStatus("PENDING");
        c.setTinNumber((String) req.get("tinNumber"));
        c.setBusinessName((String) req.getOrDefault("businessName",""));
        c.setIssuedBy((String) req.getOrDefault("issuedBy","FIRS"));
        c.setRemarks((String) req.getOrDefault("remarks",""));
        return repo.save(c);
    }

    @Transactional
    public ComplianceCertificate issue(Long id) {
        ComplianceCertificate c = getById(id);
        c.setStatus("ISSUED");
        c.setIssueDate(LocalDate.now());
        c.setExpiryDate(LocalDate.now().plusYears(1));
        c.setIssuedAt(LocalDateTime.now());
        c.setDownloadUrl("/api/v1/certificates/" + id + "/download");
        return repo.save(c);
    }
}
