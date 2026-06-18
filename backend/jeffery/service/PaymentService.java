package com.taxpadi.service;

import com.taxpadi.entity.Payment;
import com.taxpadi.entity.PaymentCertificate;
import com.taxpadi.repository.PaymentCertificateRepository;
import com.taxpadi.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentCertificateRepository certificateRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          PaymentCertificateRepository certificateRepository) {
        this.paymentRepository = paymentRepository;
        this.certificateRepository = certificateRepository;
    }

    // GET /api/v1/payments
    public Map<String, Object> getPayments(String userId, String status, String method,
                                           String dateFrom, String dateTo, int page) {
        int limit = 20;
        int pageIndex = Math.max(0, page - 1);

        LocalDateTime from = dateFrom != null ? LocalDate.parse(dateFrom).atStartOfDay() : null;
        LocalDateTime to = dateTo != null ? LocalDate.parse(dateTo).atTime(23, 59, 59) : null;

        PageRequest pageable = PageRequest.of(pageIndex, limit,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Payment> paymentsPage = paymentRepository.findFiltered(
                userId, status, method, from, to, pageable);

        List<Map<String, Object>> payments = new ArrayList<>();
        for (Payment p : paymentsPage.getContent()) {
            payments.add(mapPaymentBasic(p));
        }

        BigDecimal totalPaid = paymentRepository.sumByUserIdAndStatus(userId, "successful");
        BigDecimal totalPending = paymentRepository.sumByUserIdAndStatus(userId, "pending");
        BigDecimal totalFailed = paymentRepository.sumByUserIdAndStatus(userId, "failed");

        Map<String, Object> summary = new HashMap<>();
        summary.put("total_paid", totalPaid);
        summary.put("total_pending", totalPending);
        summary.put("total_failed", totalFailed);

        Map<String, Object> pagination = new HashMap<>();
        pagination.put("total", paymentsPage.getTotalElements());
        pagination.put("page", page);
        pagination.put("limit", limit);
        pagination.put("total_pages", paymentsPage.getTotalPages());

        Map<String, Object> data = new HashMap<>();
        data.put("payments", payments);
        data.put("summary", summary);
        data.put("pagination", pagination);
        return data;
    }

    // POST /api/v1/payments/initiate
    @Transactional
    public Map<String, Object> initiate(String userId, Map<String, Object> request) {
        String returnId = (String) request.get("return_id");
        String penaltyId = (String) request.get("penalty_id");
        String paymentMethod = (String) request.get("payment_method");
        String momoNumber = (String) request.get("momo_number");
        String momoProvider = (String) request.get("momo_provider");

        // Validate return_id or penalty_id
        if (returnId == null && penaltyId == null)
            throw new ReturnOrPenaltyRequiredException(
                    "Either return_id or penalty_id must be provided");

        // Validate amount
        if (!request.containsKey("amount") || request.get("amount") == null)
            throw new ValidationException("amount is required and must be greater than 0");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        if (amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new ValidationException("amount must be greater than 0");

        // Validate payment_method
        List<String> validMethods = Arrays.asList("momo", "bank_card", "ussd", "vault");
        if (paymentMethod == null || !validMethods.contains(paymentMethod))
            throw new ValidationException("payment_method must be one of: momo, bank_card, ussd, vault");

        // Validate momo fields
        if ("momo".equals(paymentMethod)) {
            if (momoNumber == null || momoNumber.isBlank())
                throw new ValidationException("momo_number is required for momo payment");
            List<String> validProviders = Arrays.asList("mtn", "telecel", "airteltigo");
            if (momoProvider == null || !validProviders.contains(momoProvider))
                throw new ValidationException("momo_provider must be one of: mtn, telecel, airteltigo");
        }

        // Check already paid
        if (returnId != null && paymentRepository.existsByReturnIdAndStatus(returnId, "successful"))
            throw new AlreadyPaidException("This return or penalty has already been paid");
        if (penaltyId != null && paymentRepository.existsByPenaltyIdAndStatus(penaltyId, "successful"))
            throw new AlreadyPaidException("This return or penalty has already been paid");

        // Create payment record
        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setReturnId(returnId);
        payment.setPenaltyId(penaltyId);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setMomoNumber(momoNumber);
        payment.setMomoProvider(momoProvider);
        payment.setStatus("pending");
        payment.setExpiresAt(LocalDateTime.now().plusSeconds(120));
        Payment saved = paymentRepository.save(payment);

        Map<String, Object> data = new HashMap<>();
        data.put("payment_id", saved.getPaymentId());
        data.put("amount", saved.getAmount());
        data.put("payment_method", saved.getPaymentMethod());
        data.put("status", "pending");
        data.put("momo_prompt_sent", "momo".equals(paymentMethod));
        data.put("message", "momo".equals(paymentMethod)
                ? "A payment prompt has been sent. Please approve it on your phone."
                : "Payment initiated successfully.");
        data.put("expires_in_seconds", 120);
        return data;
    }

    // GET /api/v1/payments/{id}
    public Map<String, Object> getPaymentById(String paymentId, String userId) {
        Payment payment = paymentRepository.findByPaymentIdAndUserId(paymentId, userId)
                .orElseThrow(() -> {
                    boolean exists = paymentRepository.findById(paymentId).isPresent();
                    if (exists) return new ForbiddenException(
                            "You do not have access to this payment");
                    return new PaymentNotFoundException("No payment found with this ID");
                });

        Optional<PaymentCertificate> cert = certificateRepository
                .findByPaymentId(paymentId);

        Map<String, Object> certData = new HashMap<>();
        certData.put("certificate_id", cert.map(PaymentCertificate::getCertificateId).orElse(null));
        certData.put("document_ref", cert.map(PaymentCertificate::getDocumentRef).orElse(null));

        Map<String, Object> data = mapPaymentBasic(payment);
        data.put("certificate", certData);
        return data;
    }

    // POST /api/v1/payments/{id}/confirm
    @Transactional
    public Map<String, Object> confirmPayment(String paymentId, String userId,
                                              Map<String, Object> request) {
        Payment payment = paymentRepository.findByPaymentIdAndUserId(paymentId, userId)
                .orElseThrow(() -> new PaymentNotFoundException("No payment found with this ID"));

        if (!"pending".equals(payment.getStatus()))
            throw new PaymentNotPendingException("Only pending payments can be confirmed");

        String reference = (String) request.get("payment_reference");
        String status = (String) request.get("status");

        payment.setPaymentReference(reference);
        payment.setStatus(status);
        payment.setUpdatedAt(LocalDateTime.now());

        boolean certificateGenerated = false;
        PaymentCertificate cert = null;

        if ("successful".equals(status)) {
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Generate compliance certificate
            cert = new PaymentCertificate();
            cert.setPaymentId(paymentId);
            cert.setUserId(userId);
            cert.setDocumentRef("TXPD-" + LocalDate.now().getYear() + "-" +
                    String.format("%05d", new Random().nextInt(99999)));
            cert.setAmountPaid(payment.getAmount());
            cert.setPaymentReference(reference);
            certificateRepository.save(cert);

            payment.setCertificateId(cert.getCertificateId());
            paymentRepository.save(payment);
            certificateGenerated = true;
        } else {
            paymentRepository.save(payment);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("payment_id", paymentId);
        data.put("status", status);
        data.put("payment_reference", reference);
        data.put("paid_at", payment.getPaidAt());
        data.put("certificate_generated", certificateGenerated);

        if (cert != null) {
            Map<String, Object> certData = new HashMap<>();
            certData.put("certificate_id", cert.getCertificateId());
            certData.put("document_ref", cert.getDocumentRef());
            data.put("certificate", certData);
        } else {
            data.put("certificate", null);
        }
        return data;
    }

    // GET /api/v1/payments/{id}/status
    public Map<String, Object> getPaymentStatus(String paymentId, String userId) {
        Payment payment = paymentRepository.findByPaymentIdAndUserId(paymentId, userId)
                .orElseThrow(() -> new PaymentNotFoundException("No payment found with this ID"));

        String statusMessage = switch (payment.getStatus()) {
            case "pending" -> "Your payment is still being processed.";
            case "successful" -> "Your payment was successful.";
            case "failed" -> "Your payment failed. Please try again.";
            default -> "Unknown payment status.";
        };

        Map<String, Object> data = new HashMap<>();
        data.put("payment_id", paymentId);
        data.put("status", payment.getStatus());
        data.put("payment_reference", payment.getPaymentReference());
        data.put("paid_at", payment.getPaidAt());
        data.put("message", statusMessage);
        return data;
    }

    // GET /api/v1/payments/{id}/certificate
    public Map<String, Object> getCertificate(String paymentId, String userId) {
        Payment payment = paymentRepository.findByPaymentIdAndUserId(paymentId, userId)
                .orElseThrow(() -> new PaymentNotFoundException("No payment found with this ID"));

        PaymentCertificate cert = certificateRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new CertificateNotFoundException(
                        "No certificate has been generated for this payment yet"));

        Map<String, Object> taxpayer = new HashMap<>();
        taxpayer.put("full_name", cert.getTaxpayerFullName());
        taxpayer.put("tin", cert.getTaxpayerTin());
        taxpayer.put("phone", cert.getTaxpayerPhone());

        Map<String, Object> data = new HashMap<>();
        data.put("certificate_id", cert.getCertificateId());
        data.put("document_ref", cert.getDocumentRef());
        data.put("taxpayer", taxpayer);
        data.put("tax_type", cert.getTaxType());
        data.put("period_start", cert.getPeriodStart());
        data.put("period_end", cert.getPeriodEnd());
        data.put("amount_paid", cert.getAmountPaid());
        data.put("payment_reference", cert.getPaymentReference());
        data.put("issued_at", cert.getIssuedAt());
        return data;
    }

    private Map<String, Object> mapPaymentBasic(Payment p) {
        Map<String, Object> map = new HashMap<>();
        map.put("payment_id", p.getPaymentId());
        map.put("amount", p.getAmount());
        map.put("payment_method", p.getPaymentMethod());
        map.put("payment_reference", p.getPaymentReference());
        map.put("status", p.getStatus());
        map.put("paid_at", p.getPaidAt());
        map.put("created_at", p.getCreatedAt());

        Map<String, Object> returnData = new HashMap<>();
        returnData.put("return_id", p.getReturnId());
        map.put("return", p.getReturnId() != null ? returnData : null);

        Map<String, Object> penaltyData = new HashMap<>();
        penaltyData.put("penalty_id", p.getPenaltyId());
        map.put("penalty", p.getPenaltyId() != null ? penaltyData : null);

        return map;
    }

    // Custom exceptions
    public static class ReturnOrPenaltyRequiredException extends RuntimeException {
        public ReturnOrPenaltyRequiredException(String msg) { super(msg); }
    }
    public static class AlreadyPaidException extends RuntimeException {
        public AlreadyPaidException(String msg) { super(msg); }
    }
    public static class PaymentNotFoundException extends RuntimeException {
        public PaymentNotFoundException(String msg) { super(msg); }
    }
    public static class CertificateNotFoundException extends RuntimeException {
        public CertificateNotFoundException(String msg) { super(msg); }
    }
    public static class PaymentNotPendingException extends RuntimeException {
        public PaymentNotPendingException(String msg) { super(msg); }
    }
    public static class ForbiddenException extends RuntimeException {
        public ForbiddenException(String msg) { super(msg); }
    }
    public static class ValidationException extends RuntimeException {
        public ValidationException(String msg) { super(msg); }
    }
}