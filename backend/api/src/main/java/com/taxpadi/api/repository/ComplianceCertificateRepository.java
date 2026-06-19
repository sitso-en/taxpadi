package com.taxpadi.api.repository;

import com.taxpadi.api.model.ComplianceCertificate;
import com.taxpadi.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ComplianceCertificateRepository extends JpaRepository<ComplianceCertificate, UUID> {
    List<ComplianceCertificate> findByUser(User user);
    Optional<ComplianceCertificate> findByCertificateNumber(String certificateNumber);
    boolean existsByUserAndCertificateTypeAndStatus(User user, String type, String status);
}
