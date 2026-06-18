package com.taxpadi.repository;

import com.taxpadi.entity.PaymentCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentCertificateRepository extends JpaRepository<PaymentCertificate, String> {
    Optional<PaymentCertificate> findByPaymentId(String paymentId);
}