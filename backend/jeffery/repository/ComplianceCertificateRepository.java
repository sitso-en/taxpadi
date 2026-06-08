package com.taxpadi.repository;
import com.taxpadi.entity.ComplianceCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface ComplianceCertificateRepository extends JpaRepository<ComplianceCertificate,Long> {
    List<ComplianceCertificate> findByUserId(Long userId);
    Optional<ComplianceCertificate> findByCertificateNumber(String certificateNumber);
    boolean existsByUserIdAndCertificateTypeAndStatus(Long userId, String type, String status);
}
