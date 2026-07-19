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
import com.taxpadi.api.constant.PenaltyStatus;
import com.taxpadi.api.model.NotificationType;
import com.taxpadi.api.model.Penalty;
import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.User;
import com.taxpadi.api.constant.CertificateStatus;
import com.taxpadi.api.constant.PaymentMethod;
import com.taxpadi.api.constant.PaymentStatus;
import com.taxpadi.api.constant.SubscriptionPlan;
import com.taxpadi.api.constant.SubscriptionStatus;
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

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
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
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaymentService(PaymentRepository paymentRepository,
                          TaxReturnRepository taxReturnRepository,
                          PenaltyRepository penaltyRepository,
                          ComplianceCertificateRepository certificateRepository,
                          PaystackService paystackService,
                          SubscriptionRepository subscriptionRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.taxReturnRepository = taxReturnRepository;
        this.penaltyRepository = penaltyRepository;
        this.certificateRepository = certificateRepository;
        this.paystackService = paystackService;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public PaymentListResponse getPayments(User user, String status, String method,
                                           LocalDate dateFrom, LocalDate dateTo, int page) {
        int limit = 20;
        int pageIndex = Math.max(0, page - 1);

        LocalDateTime from = dateFrom != null ? dateFrom.atStartOfDay() : null;
        LocalDateTime to = dateTo != null ? dateTo.atTime(23, 59, 59) : null;

        Specification<Payment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user"), user));
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (method != null) predicates.add(cb.equal(root.get("paymentMethod"), method));
            if (from != null) predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            if (to != null) predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageable = PageRequest.of(pageIndex, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Payment> paymentsPage = paymentRepository.findAll(spec, pageable);

        List<PaymentListItem> items = paymentsPage.getContent().stream()
                .map(this::toListItem)
                .collect(Collectors.toList());

        PaymentSummary summary = new PaymentSummary();
        summary.setTotalPaid(Optional.ofNullable(paymentRepository.sumByUserAndStatus(user, PaymentStatus.SUCCESSFUL)).orElse(BigDecimal.ZERO));
        summary.setTotalPending(Optional.ofNullable(paymentRepository.sumByUserAndStatus(user, PaymentStatus.PENDING)).orElse(BigDecimal.ZERO));
        summary.setTotalFailed(Optional.ofNullable(paymentRepository.sumByUserAndStatus(user, PaymentStatus.FAILED)).orElse(BigDecimal.ZERO));

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

        List<String> validMethods = Arrays.asList(PaymentMethod.MOMO, PaymentMethod.BANK_CARD, PaymentMethod.USSD, PaymentMethod.VAULT);
        if (paymentMethod == null || !validMethods.contains(paymentMethod))
            throw new BadRequestException("payment_method must be one of: momo, bank_card, ussd, vault");

        if (PaymentMethod.MOMO.equals(paymentMethod)) {
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
            if (paymentRepository.existsByTaxReturnAndStatus(taxReturn, PaymentStatus.SUCCESSFUL))
                throw new ConflictException("This tax return has already been paid");
        }

        if (penaltyId != null) {
            penalty = penaltyRepository.findById(penaltyId)
                    .orElseThrow(() -> new NotFoundException("Penalty not found"));
            if (paymentRepository.existsByPenaltyAndStatus(penalty, PaymentStatus.SUCCESSFUL))
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
        payment.setStatus(PaymentStatus.PENDING);
        payment.setExpiresAt(LocalDateTime.now().plusSeconds(600));
        Payment saved = paymentRepository.save(payment);

        // Call Paystack (skip for vault — internal deduction)
        String authorizationUrl = null;
        if (!PaymentMethod.VAULT.equals(paymentMethod)) {
            List<String> channels = switch (paymentMethod) {
                case PaymentMethod.MOMO -> List.of("mobile_money");
                case PaymentMethod.BANK_CARD -> List.of("card");
                case PaymentMethod.USSD -> List.of(PaymentMethod.USSD);
                default -> List.of("mobile_money", "card");
            };
            PaystackInitResult init = paystackService.initialize(user.getEmail(), amount, reference, channels);
            authorizationUrl = init.authorizationUrl;
        }

        InitiatePaymentResponse response = new InitiatePaymentResponse();
        response.setPaymentId(saved.getPaymentId());
        response.setAmount(saved.getAmount());
        response.setPaymentMethod(saved.getPaymentMethod());
        response.setStatus(PaymentStatus.PENDING);
        response.setPaymentReference(reference);
        response.setAuthorizationUrl(authorizationUrl);
        response.setMessage(PaymentMethod.VAULT.equals(paymentMethod)
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

        if (!PaymentStatus.PENDING.equals(payment.getStatus()))
            throw new BadRequestException("Only pending payments can be confirmed");

        String reference = request.getPaymentReference();
        String status = request.getStatus();

        payment.setPaymentReference(reference);
        payment.setStatus(status);

        boolean certificateGenerated = false;
        LinkedCertificateInfo certInfo = null;

        if (PaymentStatus.SUCCESSFUL.equals(status)) {
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

            String certType = resolveCertType(payment);
            String certNumber = "TXPD-" + LocalDate.now().getYear() + "-" +
                    String.format("%05d", new Random().nextInt(99999));

            ComplianceCertificate cert = new ComplianceCertificate();
            cert.setUser(user);
            cert.setCertificateNumber(certNumber);
            cert.setCertificateType(certType);
            cert.setStatus(CertificateStatus.ISSUED);
            cert.setIssueDate(LocalDate.now());
            cert.setExpiryDate(LocalDate.now().plusYears(1));
            cert.setIssuedBy("Ghana Revenue Authority");
            cert.setIssuedAt(LocalDateTime.now());
            ComplianceCertificate savedCert = certificateRepository.save(cert);

            payment.setCertificate(savedCert);
            paymentRepository.save(payment);

            // Auto-resolve linked penalty
            if (payment.getPenalty() != null) {
                Penalty penalty = payment.getPenalty();
                penalty.setStatus(PenaltyStatus.PAID);
                penalty.setPaidAt(LocalDateTime.now());
                penaltyRepository.save(penalty);
            }

            certInfo = new LinkedCertificateInfo();
            certInfo.setCertificateId(savedCert.getCertificateId());
            certInfo.setDocumentRef(savedCert.getCertificateNumber());
            certificateGenerated = true;

            notificationService.send(user,
                "Payment Confirmed",
                "Your payment of GHS " + payment.getAmount() + " was successful.",
                NotificationType.PAYMENT,
                "/payments/" + paymentId);
            notificationService.send(user,
                "Compliance Certificate Issued",
                "Your compliance certificate " + savedCert.getCertificateNumber() + " is ready to download.",
                NotificationType.SYSTEM,
                "/certificates/" + savedCert.getCertificateId());
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
            case PaymentStatus.PENDING -> "Your payment is still being processed.";
            case PaymentStatus.SUCCESSFUL -> "Your payment was successful.";
            case PaymentStatus.FAILED -> "Your payment failed. Please try again.";
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

                paymentRepository.findFirstByPaymentReference(reference).ifPresent(payment -> {
                    if (PaymentStatus.PENDING.equals(payment.getStatus())) {
                        confirmSuccessful(payment);
                    }
                });

                subscriptionRepository.findFirstByPaymentReference(reference).ifPresent(sub -> {
                    if (SubscriptionStatus.PENDING.equals(sub.getStatus())) {
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
        payment.setStatus(PaymentStatus.SUCCESSFUL);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Auto-resolve the linked penalty when payment succeeds
        if (payment.getPenalty() != null) {
            Penalty penalty = payment.getPenalty();
            penalty.setStatus(PenaltyStatus.PAID);
            penalty.setPaidAt(LocalDateTime.now());
            penaltyRepository.save(penalty);
        }

        String certNumber = "TXPD-" + LocalDate.now().getYear() + "-" +
                String.format("%05d", new Random().nextInt(99999));

        ComplianceCertificate cert = new ComplianceCertificate();
        cert.setUser(payment.getUser());
        cert.setCertificateNumber(certNumber);
        cert.setCertificateType(resolveCertType(payment));
        cert.setStatus(CertificateStatus.ISSUED);
        cert.setIssueDate(LocalDate.now());
        cert.setExpiryDate(LocalDate.now().plusYears(1));
        cert.setIssuedBy("Ghana Revenue Authority");
        cert.setIssuedAt(LocalDateTime.now());
        ComplianceCertificate savedCert = certificateRepository.save(cert);

        payment.setCertificate(savedCert);
        paymentRepository.save(payment);

        notificationService.send(payment.getUser(),
            "Payment Confirmed",
            "Your payment of GHS " + payment.getAmount() + " was successful.",
            NotificationType.PAYMENT,
            "/payments/" + payment.getPaymentId());
        notificationService.send(payment.getUser(),
            "Compliance Certificate Issued",
            "Your compliance certificate " + savedCert.getCertificateNumber() + " is ready to download.",
            NotificationType.SYSTEM,
            "/certificates/" + savedCert.getCertificateId());
    }

    private void activateSubscription(Subscription sub) {
        LocalDateTime now = LocalDateTime.now();
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setSubscriptionTier(SubscriptionTier.PAID);
        sub.setStartedAt(now);
        LocalDateTime expiresAt = SubscriptionPlan.MONTHLY.equals(sub.getPlan()) ? now.plusMonths(1) : now.plusYears(1);
        sub.setExpiresAt(expiresAt);
        subscriptionRepository.save(sub);

        User user = sub.getUser();
        user.setSubscriptionTier(SubscriptionTier.PAID);
        userRepository.save(user);

        String plan = SubscriptionPlan.MONTHLY.equals(sub.getPlan()) ? "monthly" : "annual";
        notificationService.send(user,
            "Subscription Activated",
            "Your TaxPadi " + plan + " plan is now active. Enjoy full access until " + expiresAt.toLocalDate() + ".",
            NotificationType.SYSTEM,
            "/subscription");
    }

    private String resolveCertType(Payment payment) {
        if (payment.getTaxReturn() != null)
            return payment.getTaxReturn().getTaxType();
        if (payment.getPenalty() != null)
            return "PENALTY";
        return "GENERAL";
    }
}
