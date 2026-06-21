package com.taxpadi.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxpadi.api.dto.certificate.TaxpayerInfo;
import com.taxpadi.api.service.PaystackService.PaystackInitResult;
import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.payment.ConfirmPaymentRequest;
import com.taxpadi.api.dto.payment.ConfirmPaymentResponse;
import com.taxpadi.api.dto.payment.InitiatePaymentRequest;
import com.taxpadi.api.dto.payment.InitiatePaymentResponse;
import com.taxpadi.api.dto.payment.LinkedCertificateInfo;
import com.taxpadi.api.dto.payment.LinkedPenaltyInfo;
import com.taxpadi.api.dto.payment.LinkedReturnInfo;
import com.taxpadi.api.dto.payment.PaymentCertificateResponse;
import com.taxpadi.api.dto.payment.PaymentDetailDto;
import com.taxpadi.api.dto.payment.PaymentListItem;
import com.taxpadi.api.dto.payment.PaymentListResponse;
import com.taxpadi.api.dto.payment.PaymentStatusDto;
import com.taxpadi.api.dto.payment.PaymentSummary;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ConflictException;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.ComplianceCertificate;
import com.taxpadi.api.model.Payment;
import com.taxpadi.api.model.Penalty;
import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.Subscription;
import com.taxpadi.api.model.SubscriptionTier;
import com.taxpadi.api.repository.ComplianceCertificateRepository;
import com.taxpadi.api.repository.PaymentRepository;
import com.taxpadi.api.repository.PenaltyRepository;
import com.taxpadi.api.repository.SubscriptionRepository;
import com.taxpadi.api.repository.TaxReturnRepository;
import com.taxpadi.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TaxReturnRepository taxReturnRepository;
    private final PenaltyRepository penaltyRepository;
    private final ComplianceCertificateRepository certificateRepository;
    private final PaystackService paystackService;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaymentService(PaymentRepository paymentRepository,
                          TaxReturnRepository taxReturnRepository,
                          PenaltyRepository penaltyRepository,
                          ComplianceCertificateRepository certificateRepository,
                          PaystackService paystackService,
                          SubscriptionRepository subscriptionRepository,
                          UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.taxReturnRepository = taxReturnRepository;
        this.penaltyRepository = penaltyRepository;
        this.certificateRepository = certificateRepository;
        this.paystackService = paystackService;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PaymentListResponse getPayments(User user, String status, String method,
                                           String dateFrom, String dateTo, int page) {
        int limit = 20;
        int pageIndex = Math.max(0, page - 1);

        LocalDateTime from = dateFrom != null ? LocalDate.parse(dateFrom).atStartOfDay() : null;
        LocalDateTime to = dateTo != null ? LocalDate.parse(dateTo).atTime(23, 59, 59) : null;

        PageRequest pageable = PageRequest.of(pageIndex, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Payment> paymentsPage = paymentRepository.findFiltered(user, status, method, from, to, pageable);

        List<PaymentListItem> items = paymentsPage.getContent().stream()
                .map(this::toListItem)
                .collect(Collectors.toList());

        PaymentSummary summary = new PaymentSummary();
        summary.setTotalPaid(paymentRepository.sumByUserAndStatus(user, "successful"));
        summary.setTotalPending(paymentRepository.sumByUserAndStatus(user, "pending"));
        summary.setTotalFailed(paymentRepository.sumByUserAndStatus(user, "failed"));

        PaymentListResponse response = new PaymentListResponse();
        response.setPayments(items);
        response.setSummary(summary);
        response.setPagination(new PaginationInfo(
                paymentsPage.getTotalElements(), page, limit, paymentsPage.getTotalPages()));
        return response;
    }

    @Transactional
    public InitiatePaymentResponse initiate(User user, InitiatePaymentRequest request) {
        UUID returnId = request.getReturnId();
        UUID penaltyId = request.getPenaltyId();
        String paymentMethod = request.getPaymentMethod();

        if (returnId == null && penaltyId == null)
            throw new BadRequestException("Either return_id or penalty_id must be provided");

        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new BadRequestException("amount is required and must be greater than 0");

        List<String> validMethods = Arrays.asList("momo", "bank_card", "ussd", "vault");
        if (paymentMethod == null || !validMethods.contains(paymentMethod))
            throw new BadRequestException("payment_method must be one of: momo, bank_card, ussd, vault");

        if ("momo".equals(paymentMethod)) {
            if (request.getMomoNumber() == null || request.getMomoNumber().isBlank())
                throw new BadRequestException("momo_number is required for momo payment");
            List<String> validProviders = Arrays.asList("mtn", "telecel", "airteltigo");
            if (request.getMomoProvider() == null || !validProviders.contains(request.getMomoProvider()))
                throw new BadRequestException("momo_provider must be one of: mtn, telecel, airteltigo");
        }

        TaxReturn taxReturn = null;
        Penalty penalty = null;

        if (returnId != null) {
            taxReturn = taxReturnRepository.findById(returnId)
                    .orElseThrow(() -> new NotFoundException("Tax return not found"));
            if (paymentRepository.existsByTaxReturnAndStatus(taxReturn, "successful"))
                throw new ConflictException("This tax return has already been paid");
        }

        if (penaltyId != null) {
            penalty = penaltyRepository.findById(penaltyId)
                    .orElseThrow(() -> new NotFoundException("Penalty not found"));
            if (paymentRepository.existsByPenaltyAndStatus(penalty, "successful"))
                throw new ConflictException("This penalty has already been paid");
        }

        // Generate a unique Paystack reference
        String reference = "TXPD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setTaxReturn(taxReturn);
        payment.setPenalty(penalty);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setMomoNumber(request.getMomoNumber());
        payment.setMomoProvider(request.getMomoProvider());
        payment.setPaymentReference(reference);
        payment.setStatus("pending");
        payment.setExpiresAt(LocalDateTime.now().plusSeconds(600));
        Payment saved = paymentRepository.save(payment);

        // Call Paystack (skip for vault — internal deduction)
        String authorizationUrl = null;
        if (!"vault".equals(paymentMethod)) {
            List<String> channels = switch (paymentMethod) {
                case "momo" -> List.of("mobile_money");
                case "bank_card" -> List.of("card");
                case "ussd" -> List.of("ussd");
                default -> List.of("mobile_money", "card");
            };
            PaystackInitResult init = paystackService.initialize(user.getEmail(), amount, reference, channels);
            authorizationUrl = init.authorizationUrl;
        }

        InitiatePaymentResponse response = new InitiatePaymentResponse();
        response.setPaymentId(saved.getPaymentId());
        response.setAmount(saved.getAmount());
        response.setPaymentMethod(saved.getPaymentMethod());
        response.setStatus("pending");
        response.setPaymentReference(reference);
        response.setAuthorizationUrl(authorizationUrl);
        response.setMessage("vault".equals(paymentMethod)
                ? "Payment initiated from your savings vault."
                : "Redirect the user to the authorization URL to complete payment.");
        return response;
    }

    @Transactional(readOnly = true)
    public PaymentDetailDto getPaymentById(UUID paymentId, User user) {
        Payment payment = paymentRepository.findByPaymentIdAndUser(paymentId, user)
                .orElseGet(() -> {
                    if (paymentRepository.existsById(paymentId))
                        throw new ForbiddenException("You do not have access to this payment");
                    throw new NotFoundException("No payment found with this ID");
                });

        PaymentDetailDto dto = toDetailDto(payment);

        ComplianceCertificate cert = payment.getCertificate();
        if (cert != null) {
            LinkedCertificateInfo certInfo = new LinkedCertificateInfo();
            certInfo.setCertificateId(cert.getCertificateId());
            certInfo.setDocumentRef(cert.getCertificateNumber());
            dto.setCertificate(certInfo);
        }
        return dto;
    }

    @Transactional
    public ConfirmPaymentResponse confirmPayment(UUID paymentId, User user, ConfirmPaymentRequest request) {
        Payment payment = paymentRepository.findByPaymentIdAndUser(paymentId, user)
                .orElseThrow(() -> new NotFoundException("No payment found with this ID"));

        if (!"pending".equals(payment.getStatus()))
            throw new BadRequestException("Only pending payments can be confirmed");

        String reference = request.getPaymentReference();
        String status = request.getStatus();

        payment.setPaymentReference(reference);
        payment.setStatus(status);

        boolean certificateGenerated = false;
        LinkedCertificateInfo certInfo = null;

        if ("successful".equals(status)) {
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

            String certType = resolveCertType(payment);
            String certNumber = "TXPD-" + LocalDate.now().getYear() + "-" +
                    String.format("%05d", new Random().nextInt(99999));

            ComplianceCertificate cert = new ComplianceCertificate();
            cert.setUser(user);
            cert.setCertificateNumber(certNumber);
            cert.setCertificateType(certType);
            cert.setStatus("ISSUED");
            cert.setIssueDate(LocalDate.now());
            cert.setExpiryDate(LocalDate.now().plusYears(1));
            cert.setIssuedBy("Ghana Revenue Authority");
            cert.setIssuedAt(LocalDateTime.now());
            ComplianceCertificate savedCert = certificateRepository.save(cert);

            payment.setCertificate(savedCert);
            paymentRepository.save(payment);

            certInfo = new LinkedCertificateInfo();
            certInfo.setCertificateId(savedCert.getCertificateId());
            certInfo.setDocumentRef(savedCert.getCertificateNumber());
            certificateGenerated = true;
        } else {
            paymentRepository.save(payment);
        }

        ConfirmPaymentResponse response = new ConfirmPaymentResponse();
        response.setPaymentId(paymentId);
        response.setStatus(status);
        response.setPaymentReference(reference);
        response.setPaidAt(payment.getPaidAt());
        response.setCertificateGenerated(certificateGenerated);
        response.setCertificate(certInfo);
        return response;
    }

    @Transactional(readOnly = true)
    public PaymentStatusDto getPaymentStatus(UUID paymentId, User user) {
        Payment payment = paymentRepository.findByPaymentIdAndUser(paymentId, user)
                .orElseThrow(() -> new NotFoundException("No payment found with this ID"));

        String statusMessage = switch (payment.getStatus()) {
            case "pending" -> "Your payment is still being processed.";
            case "successful" -> "Your payment was successful.";
            case "failed" -> "Your payment failed. Please try again.";
            default -> "Unknown payment status.";
        };

        PaymentStatusDto dto = new PaymentStatusDto();
        dto.setPaymentId(paymentId);
        dto.setStatus(payment.getStatus());
        dto.setPaymentReference(payment.getPaymentReference());
        dto.setPaidAt(payment.getPaidAt());
        dto.setMessage(statusMessage);
        return dto;
    }

    @Transactional(readOnly = true)
    public PaymentCertificateResponse getCertificate(UUID paymentId, User user) {
        Payment payment = paymentRepository.findByPaymentIdAndUser(paymentId, user)
                .orElseThrow(() -> new NotFoundException("No payment found with this ID"));

        ComplianceCertificate cert = payment.getCertificate();
        if (cert == null)
            throw new NotFoundException("No certificate has been generated for this payment yet");

        TaxpayerInfo taxpayer = new TaxpayerInfo(user.getFullName(), user.getTin(), user.getPhone());

        String taxType = resolveCertType(payment);
        LocalDate periodStart = null;
        LocalDate periodEnd = null;
        if (payment.getTaxReturn() != null) {
            periodStart = payment.getTaxReturn().getPeriodStart();
            periodEnd = payment.getTaxReturn().getPeriodEnd();
        }

        PaymentCertificateResponse response = new PaymentCertificateResponse();
        response.setCertificateId(cert.getCertificateId());
        response.setDocumentRef(cert.getCertificateNumber());
        response.setTaxpayer(taxpayer);
        response.setTaxType(taxType);
        response.setPeriodStart(periodStart);
        response.setPeriodEnd(periodEnd);
        response.setAmountPaid(payment.getAmount());
        response.setPaymentReference(payment.getPaymentReference());
        response.setIssuedAt(cert.getIssuedAt());
        return response;
    }

    private PaymentListItem toListItem(Payment p) {
        PaymentListItem item = new PaymentListItem();
        item.setPaymentId(p.getPaymentId());
        item.setAmount(p.getAmount());
        item.setPaymentMethod(p.getPaymentMethod());
        item.setPaymentReference(p.getPaymentReference());
        item.setStatus(p.getStatus());
        item.setPaidAt(p.getPaidAt());
        item.setCreatedAt(p.getCreatedAt());

        if (p.getTaxReturn() != null) {
            LinkedReturnInfo r = new LinkedReturnInfo();
            r.setReturnId(p.getTaxReturn().getReturnId());
            r.setTaxType(p.getTaxReturn().getTaxType());
            r.setTaxYear(p.getTaxReturn().getTaxYear());
            item.setTaxReturn(r);
        }
        if (p.getPenalty() != null) {
            LinkedPenaltyInfo pen = new LinkedPenaltyInfo();
            pen.setPenaltyId(p.getPenalty().getPenaltyId());
            item.setPenalty(pen);
        }
        return item;
    }

    private PaymentDetailDto toDetailDto(Payment p) {
        PaymentDetailDto dto = new PaymentDetailDto();
        dto.setPaymentId(p.getPaymentId());
        dto.setAmount(p.getAmount());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setPaymentReference(p.getPaymentReference());
        dto.setStatus(p.getStatus());
        dto.setPaidAt(p.getPaidAt());
        dto.setCreatedAt(p.getCreatedAt());

        if (p.getTaxReturn() != null) {
            TaxReturn tr = p.getTaxReturn();
            LinkedReturnInfo r = new LinkedReturnInfo();
            r.setReturnId(tr.getReturnId());
            r.setTaxType(tr.getTaxType());
            r.setTaxYear(tr.getTaxYear());
            r.setPeriodStart(tr.getPeriodStart());
            r.setPeriodEnd(tr.getPeriodEnd());
            dto.setTaxReturn(r);
        }
        if (p.getPenalty() != null) {
            LinkedPenaltyInfo pen = new LinkedPenaltyInfo();
            pen.setPenaltyId(p.getPenalty().getPenaltyId());
            dto.setPenalty(pen);
        }
        return dto;
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (!paystackService.validateSignature(payload, signature))
            throw new BadRequestException("Invalid webhook signature");

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> event = objectMapper.readValue(payload, Map.class);
            String eventType = (String) event.get("event");

            if ("charge.success".equals(eventType)) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) event.get("data");
                String reference = (String) data.get("reference");

                paymentRepository.findByPaymentReference(reference).ifPresent(payment -> {
                    if ("pending".equals(payment.getStatus())) {
                        confirmSuccessful(payment);
                    }
                });

                subscriptionRepository.findByPaymentReference(reference).ifPresent(sub -> {
                    if ("pending".equals(sub.getStatus())) {
                        activateSubscription(sub);
                    }
                });
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Invalid webhook payload");
        }
    }

    private void confirmSuccessful(Payment payment) {
        payment.setStatus("successful");
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        String certNumber = "TXPD-" + LocalDate.now().getYear() + "-" +
                String.format("%05d", new Random().nextInt(99999));

        ComplianceCertificate cert = new ComplianceCertificate();
        cert.setUser(payment.getUser());
        cert.setCertificateNumber(certNumber);
        cert.setCertificateType(resolveCertType(payment));
        cert.setStatus("ISSUED");
        cert.setIssueDate(LocalDate.now());
        cert.setExpiryDate(LocalDate.now().plusYears(1));
        cert.setIssuedBy("Ghana Revenue Authority");
        cert.setIssuedAt(LocalDateTime.now());
        ComplianceCertificate savedCert = certificateRepository.save(cert);

        payment.setCertificate(savedCert);
        paymentRepository.save(payment);
    }

    private void activateSubscription(Subscription sub) {
        LocalDateTime now = LocalDateTime.now();
        sub.setStatus("active");
        sub.setSubscriptionTier(SubscriptionTier.PAID);
        sub.setStartedAt(now);
        sub.setExpiresAt("monthly".equals(sub.getPlan()) ? now.plusMonths(1) : now.plusYears(1));
        subscriptionRepository.save(sub);

        User user = sub.getUser();
        user.setSubscriptionTier(SubscriptionTier.PAID);
        userRepository.save(user);
    }

    private String resolveCertType(Payment payment) {
        if (payment.getTaxReturn() != null)
            return payment.getTaxReturn().getTaxType();
        if (payment.getPenalty() != null)
            return "PENALTY";
        return "GENERAL";
    }
}
