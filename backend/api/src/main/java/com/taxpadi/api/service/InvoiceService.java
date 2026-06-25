package com.taxpadi.api.service;

import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.invoice.*;
import com.taxpadi.api.dto.transaction.VaultSuggestion;
import com.taxpadi.api.constant.InvoiceStatus;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.constant.InvoiceStatus;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.Invoice;
import com.taxpadi.api.model.NotificationType;
import com.taxpadi.api.model.Transaction;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.UserTaxProfile;
import com.taxpadi.api.repository.InvoiceRepository;
import com.taxpadi.api.repository.TaxCalculationRepository;
import com.taxpadi.api.repository.TransactionRepository;
import com.taxpadi.api.repository.UserTaxProfileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService {

    private static final BigDecimal VAT_RATE = new BigDecimal("0.21");

    private final InvoiceRepository invoiceRepository;
    private final TransactionRepository transactionRepository;
    private final UserTaxProfileRepository userTaxProfileRepository;
    private final TaxCalculationRepository taxCalculationRepository;
    private final PdfService pdfService;
    private final CloudinaryService cloudinaryService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${app.base-url}")
    private String baseUrl;

    public InvoiceService(InvoiceRepository invoiceRepository,
            TransactionRepository transactionRepository,
            UserTaxProfileRepository userTaxProfileRepository,
            TaxCalculationRepository taxCalculationRepository,
            PdfService pdfService,
            CloudinaryService cloudinaryService,
            EmailService emailService,
            NotificationService notificationService) {
        this.invoiceRepository = invoiceRepository;
        this.transactionRepository = transactionRepository;
        this.userTaxProfileRepository = userTaxProfileRepository;
        this.taxCalculationRepository = taxCalculationRepository;
        this.pdfService = pdfService;
        this.cloudinaryService = cloudinaryService;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    public InvoiceListResponse getInvoices(User user, int page, int limit, String status) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);

        Page<Invoice> results = (status != null)
            ? invoiceRepository.findAllByUserAndStatusOrderByCreatedAtDesc(user, status, PageRequest.of(safePage, safeLimit))
            : invoiceRepository.findAllByUserOrderByCreatedAtDesc(user, PageRequest.of(safePage, safeLimit));

        List<InvoiceSummaryDto> invoices = results.getContent().stream()
            .map(this::toSummary)
            .toList();

        return new InvoiceListResponse(
            invoices,
            new PaginationInfo(results.getTotalElements(), page, safeLimit, results.getTotalPages())
        );
    }

    public InvoiceStatsResponse getStats(User user) {
        LocalDate today = LocalDate.now();
        BigDecimal totalPaid = invoiceRepository.sumTotalAmountByUserAndStatus(user, "paid");
        BigDecimal totalOutstanding = invoiceRepository.sumTotalAmountByUserAndStatus(user, InvoiceStatus.UNPAID);
        BigDecimal totalInvoiced = totalPaid.add(totalOutstanding);
        BigDecimal totalOverdue = invoiceRepository.sumOverdueByUser(user, today);

        long countPaid = invoiceRepository.countByUserAndStatus(user, "paid");
        long countUnpaid = invoiceRepository.countByUserAndStatus(user, InvoiceStatus.UNPAID);
        long countCancelled = invoiceRepository.countByUserAndStatus(user, InvoiceStatus.CANCELLED);
        long countOverdue = invoiceRepository.countOverdueByUser(user, today);
        long countTotal = countPaid + countUnpaid + countCancelled;

        InvoiceStatsResponse response = new InvoiceStatsResponse();
        response.setTotalInvoiced(totalInvoiced);
        response.setTotalPaid(totalPaid);
        response.setTotalOutstanding(totalOutstanding);
        response.setTotalOverdue(totalOverdue);
        response.setInvoiceCount(new InvoiceCountDto(countTotal, countPaid, countUnpaid, countOverdue, countCancelled));
        return response;
    }

    @Transactional
    public CreateInvoiceResponse create(User user, CreateInvoiceRequest request) {
        boolean vatRegistered = userTaxProfileRepository.findByUser(user)
            .map(UserTaxProfile::getVatRegistered)
            .orElse(false);

        BigDecimal subtotal = request.getSubtotal();
        BigDecimal vatAmount = vatRegistered
            ? subtotal.multiply(VAT_RATE).setScale(2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(vatAmount);

        Invoice invoice = new Invoice();
        invoice.setUser(user);
        invoice.setClientName(request.getClientName());
        invoice.setClientEmail(request.getClientEmail());
        invoice.setClientPhone(request.getClientPhone());
        invoice.setDescription(request.getDescription());
        invoice.setSubtotal(subtotal);
        invoice.setVatAmount(vatAmount);
        invoice.setTotalAmount(totalAmount);
        if (request.getDueDate() != null) {
            invoice.setDueDate(LocalDate.parse(request.getDueDate()));
        }
        invoice.setInvoiceRef(generateRef(user));
        invoice = invoiceRepository.save(invoice);

        String pdfUrl = generateAndUploadPdf(invoice);
        invoice.setPdfUrl(pdfUrl);
        invoice = invoiceRepository.save(invoice);

        CreateInvoiceResponse response = new CreateInvoiceResponse();
        response.setInvoiceId(invoice.getInvoiceId());
        response.setInvoiceRef(invoice.getInvoiceRef());
        response.setClientName(invoice.getClientName());
        response.setSubtotal(invoice.getSubtotal());
        response.setVatAmount(invoice.getVatAmount());
        response.setTotalAmount(invoice.getTotalAmount());
        response.setStatus(invoice.getStatus());
        response.setPdfUrl(invoice.getPdfUrl());
        response.setCreatedAt(invoice.getCreatedAt());
        return response;
    }

    public InvoiceDetailDto getInvoice(User user, UUID id) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        return toDetail(invoice);
    }

    @Transactional
    public UpdateInvoiceResponse update(User user, UUID id, UpdateInvoiceRequest request) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        if (!InvoiceStatus.UNPAID.equals(invoice.getStatus())) {
            throw new BadRequestException("Only unpaid invoices can be edited");
        }

        boolean vatRegistered = userTaxProfileRepository.findByUser(user)
            .map(UserTaxProfile::getVatRegistered)
            .orElse(false);

        if (request.getClientName() != null) invoice.setClientName(request.getClientName());
        if (request.getClientEmail() != null) invoice.setClientEmail(request.getClientEmail());
        if (request.getClientPhone() != null) invoice.setClientPhone(request.getClientPhone());
        if (request.getDescription() != null) invoice.setDescription(request.getDescription());
        if (request.getDueDate() != null) invoice.setDueDate(LocalDate.parse(request.getDueDate()));

        if (request.getSubtotal() != null) {
            BigDecimal subtotal = request.getSubtotal();
            BigDecimal vatAmount = vatRegistered
                ? subtotal.multiply(VAT_RATE).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
            invoice.setSubtotal(subtotal);
            invoice.setVatAmount(vatAmount);
            invoice.setTotalAmount(subtotal.add(vatAmount));
        }

        invoice = invoiceRepository.save(invoice);
        invoice.setPdfUrl(generateAndUploadPdf(invoice));
        invoice = invoiceRepository.save(invoice);

        UpdateInvoiceResponse response = new UpdateInvoiceResponse();
        response.setInvoiceId(invoice.getInvoiceId());
        response.setInvoiceRef(invoice.getInvoiceRef());
        response.setSubtotal(invoice.getSubtotal());
        response.setVatAmount(invoice.getVatAmount());
        response.setTotalAmount(invoice.getTotalAmount());
        response.setPdfUrl(invoice.getPdfUrl());
        response.setUpdatedAt(invoice.getUpdatedAt());
        return response;
    }

    @Transactional
    public MarkPaidResponse markPaid(User user, UUID id, MarkPaidRequest request) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        if (!InvoiceStatus.UNPAID.equals(invoice.getStatus())) {
            throw new BadRequestException("Only unpaid invoices can be marked as paid");
        }

        LocalDateTime paidAt = (request != null && request.getPaidAt() != null && !request.getPaidAt().isBlank())
            ? LocalDateTime.parse(request.getPaidAt())
            : LocalDateTime.now();

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setType("income");
        tx.setAmount(invoice.getTotalAmount());
        tx.setCategory("Invoice Payment");
        tx.setDescription("Payment for invoice " + invoice.getInvoiceRef());
        tx.setEntryMethod("invoice");
        tx.setTransactionDate(paidAt.toLocalDate());
        tx = transactionRepository.save(tx);

        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(paidAt);
        invoice.setTransaction(tx);
        invoiceRepository.save(invoice);

        notificationService.send(user,
            "Invoice Paid",
            "Invoice " + invoice.getInvoiceRef() + " has been marked as paid.",
            NotificationType.PAYMENT, null);

        VaultSuggestion vaultSuggestion = buildVaultSuggestion(user, invoice.getSubtotal());

        MarkPaidResponse response = new MarkPaidResponse();
        response.setInvoiceId(invoice.getInvoiceId());
        response.setInvoiceRef(invoice.getInvoiceRef());
        response.setStatus(InvoiceStatus.PAID);
        response.setPaidAt(paidAt);
        response.setTransactionCreated(true);
        response.setTransactionId(tx.getTransactionId());
        response.setTaxLiabilityUpdated(true);
        response.setVaultSuggestion(vaultSuggestion);
        return response;
    }

    @Transactional
    public CancelInvoiceResponse cancel(User user, UUID id, CancelInvoiceRequest request) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        if (!InvoiceStatus.UNPAID.equals(invoice.getStatus())) {
            throw new BadRequestException("Only unpaid invoices can be cancelled");
        }

        invoice.setStatus(InvoiceStatus.CANCELLED);
        invoice.setCancelledAt(LocalDateTime.now());
        if (request != null && request.getReason() != null) {
            invoice.setCancelReason(request.getReason());
        }
        invoiceRepository.save(invoice);

        CancelInvoiceResponse response = new CancelInvoiceResponse();
        response.setInvoiceId(invoice.getInvoiceId());
        response.setInvoiceRef(invoice.getInvoiceRef());
        response.setStatus(InvoiceStatus.CANCELLED);
        response.setCancelledAt(invoice.getCancelledAt());
        return response;
    }

    public PdfUrlResponse getPdfUrl(User user, UUID id) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        PdfUrlResponse response = new PdfUrlResponse();
        response.setInvoiceId(invoice.getInvoiceId());
        response.setInvoiceRef(invoice.getInvoiceRef());
        response.setPdfUrl(invoice.getPdfUrl() != null ? invoice.getPdfUrl() : "");
        return response;
    }

    public Invoice getInvoiceEntity(User user, UUID id) {
        return invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
    }

    public byte[] downloadPdf(User user, UUID id) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        return fetchPdfBytes(invoice);
    }

    public Invoice getInvoiceForDownload(UUID id) {
        return invoiceRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
    }

    public byte[] downloadPdfPublic(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        return fetchPdfBytes(invoice);
    }

    @Transactional
    public SendInvoiceResponse send(User user, UUID id, String channel) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));

        invoice.setSentVia(channel);
        invoice.setSentAt(LocalDateTime.now());
        invoiceRepository.save(invoice);

        DeliveryInfo delivery = new DeliveryInfo();
        if ("whatsapp".equals(channel) && invoice.getClientPhone() != null) {
            String phone = invoice.getClientPhone().replaceAll("[^0-9]", "");
            String message = "Hello " + invoice.getClientName() + ", please find your invoice "
                + invoice.getInvoiceRef() + " here: " + invoice.getPdfUrl();
            delivery.setWhatsappLink("https://wa.me/" + phone + "?text=" + message);
        } else if ("email".equals(channel) && invoice.getClientEmail() != null) {
            emailService.sendInvoice(
                invoice.getClientEmail(),
                invoice.getClientName(),
                invoice.getInvoiceRef(),
                invoice.getTotalAmount().toPlainString(),
                invoice.getDueDate() != null ? invoice.getDueDate().toString() : null,
                baseUrl + "/api/v1/invoices/" + invoice.getInvoiceId() + "/pdf/download",
                user.getFullName(),
                user.getEmail()
            );
        } else {
            delivery.setDownloadUrl("/api/v1/invoices/" + invoice.getInvoiceId() + "/pdf/download");
        }

        SendInvoiceResponse response = new SendInvoiceResponse();
        response.setInvoiceId(invoice.getInvoiceId());
        response.setInvoiceRef(invoice.getInvoiceRef());
        response.setSentVia(channel);
        response.setSentTo(new SentTo(
            invoice.getClientName() != null ? invoice.getClientName() : "",
            invoice.getClientEmail() != null ? invoice.getClientEmail() : ""
        ));
        response.setSentAt(invoice.getSentAt());
        response.setDelivery(delivery);
        return response;
    }

    // --- Helpers ---

    private VaultSuggestion buildVaultSuggestion(User user, BigDecimal subtotal) {
        int year = LocalDate.now().getYear();
        return taxCalculationRepository.findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
            user, "income_tax",
            LocalDate.of(year, 1, 1),
            LocalDate.of(year, 12, 31)
        ).filter(c -> c.getGrossIncome() != null
            && c.getGrossIncome().compareTo(BigDecimal.ZERO) > 0
            && c.getTaxLiability() != null
            && c.getTaxLiability().compareTo(BigDecimal.ZERO) > 0
        ).map(c -> {
            BigDecimal effectiveRate = c.getTaxLiability()
                .divide(c.getGrossIncome(), 4, RoundingMode.HALF_UP);
            BigDecimal suggested = subtotal.multiply(effectiveRate).setScale(2, RoundingMode.HALF_UP);
            VaultSuggestion vault = new VaultSuggestion();
            vault.setSuggested(true);
            vault.setSuggestedAmount(suggested);
            vault.setMessage("Consider saving GHS " + suggested
                + " (" + toPercent(effectiveRate) + " effective rate) for taxes on this income");
            return vault;
        }).orElseGet(() -> {
            VaultSuggestion vault = new VaultSuggestion();
            vault.setSuggested(false);
            return vault;
        });
    }

    private String toPercent(BigDecimal rate) {
        return rate.multiply(new BigDecimal("100")).setScale(1, RoundingMode.HALF_UP).toPlainString() + "%";
    }

    private String generateRef(User user) {
        int year = LocalDate.now().getYear();
        String prefix = "INV-" + year + "-";
        long count = invoiceRepository.countByUserAndInvoiceRefStartingWith(user, prefix);
        return String.format("%s%05d", prefix, count + 1);
    }

    private String generateAndUploadPdf(Invoice invoice) {
        byte[] pdfBytes = pdfService.generateInvoicePdf(invoice);
        return cloudinaryService.uploadPdf(pdfBytes, "invoices/" + invoice.getInvoiceRef());
    }

    private byte[] fetchPdfBytes(Invoice invoice) {
        if (invoice.getPdfUrl() == null || invoice.getPdfUrl().isBlank()) {
            throw new RuntimeException("PDF_NOT_AVAILABLE");
        }
        try {
            java.net.URL url = new java.net.URI(invoice.getPdfUrl()).toURL();
            return url.openStream().readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("PDF_NOT_AVAILABLE");
        }
    }

    private InvoiceSummaryDto toSummary(Invoice i) {
        InvoiceSummaryDto dto = new InvoiceSummaryDto();
        dto.setInvoiceId(i.getInvoiceId());
        dto.setInvoiceRef(i.getInvoiceRef());
        dto.setClientName(i.getClientName());
        dto.setTotalAmount(i.getTotalAmount());
        dto.setStatus(i.getStatus());
        dto.setDueDate(i.getDueDate());
        dto.setCreatedAt(i.getCreatedAt());
        return dto;
    }

    private InvoiceDetailDto toDetail(Invoice i) {
        InvoiceDetailDto dto = new InvoiceDetailDto();
        dto.setInvoiceId(i.getInvoiceId());
        dto.setInvoiceRef(i.getInvoiceRef());
        dto.setClientName(i.getClientName());
        dto.setClientEmail(i.getClientEmail());
        dto.setClientPhone(i.getClientPhone());
        dto.setDescription(i.getDescription());
        dto.setSubtotal(i.getSubtotal());
        dto.setVatAmount(i.getVatAmount());
        dto.setTotalAmount(i.getTotalAmount());
        dto.setStatus(i.getStatus());
        dto.setDueDate(i.getDueDate());
        dto.setPaidAt(i.getPaidAt());
        dto.setSentVia(i.getSentVia());
        dto.setPdfUrl(i.getPdfUrl());
        dto.setCreatedAt(i.getCreatedAt());
        dto.setUpdatedAt(i.getUpdatedAt());
        return dto;
    }
}
