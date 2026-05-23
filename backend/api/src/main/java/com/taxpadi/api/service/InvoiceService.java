package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.Invoice;
import com.taxpadi.api.model.NotificationType;
import com.taxpadi.api.model.Transaction;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.UserTaxProfile;
import com.taxpadi.api.repository.InvoiceRepository;
import com.taxpadi.api.repository.TransactionRepository;
import com.taxpadi.api.repository.UserTaxProfileRepository;

@Service
public class InvoiceService {

    private static final BigDecimal VAT_RATE = new BigDecimal("0.21");
    private static final BigDecimal TAX_SUGGESTION_RATE = new BigDecimal("0.25");

    private final InvoiceRepository invoiceRepository;
    private final TransactionRepository transactionRepository;
    private final UserTaxProfileRepository userTaxProfileRepository;
    private final PdfService pdfService;
    private final CloudinaryService cloudinaryService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @org.springframework.beans.factory.annotation.Value("${app.base-url}")
    private String baseUrl;

    public InvoiceService(InvoiceRepository invoiceRepository,
            TransactionRepository transactionRepository,
            UserTaxProfileRepository userTaxProfileRepository,
            PdfService pdfService,
            CloudinaryService cloudinaryService,
            EmailService emailService,
            NotificationService notificationService) {
        this.invoiceRepository = invoiceRepository;
        this.transactionRepository = transactionRepository;
        this.userTaxProfileRepository = userTaxProfileRepository;
        this.pdfService = pdfService;
        this.cloudinaryService = cloudinaryService;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    public Map<String, Object> getInvoices(User user, int page, int limit, String status) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);

        Page<Invoice> results = (status != null)
            ? invoiceRepository.findAllByUserAndStatusOrderByCreatedAtDesc(user, status, PageRequest.of(safePage, safeLimit))
            : invoiceRepository.findAllByUserOrderByCreatedAtDesc(user, PageRequest.of(safePage, safeLimit));

        List<Map<String, Object>> invoices = results.getContent().stream()
            .map(this::toSummary)
            .toList();

        return Map.of(
            "invoices", invoices,
            "pagination", Map.of(
                "total", results.getTotalElements(),
                "page", page,
                "limit", safeLimit,
                "total_pages", results.getTotalPages()
            )
        );
    }

    public Map<String, Object> getStats(User user) {
        LocalDate today = LocalDate.now();
        BigDecimal totalPaid = invoiceRepository.sumTotalAmountByUserAndStatus(user, "paid");
        BigDecimal totalOutstanding = invoiceRepository.sumTotalAmountByUserAndStatus(user, "unpaid");
        BigDecimal totalInvoiced = totalPaid.add(totalOutstanding);
        BigDecimal totalOverdue = invoiceRepository.sumOverdueByUser(user, today);

        long countPaid = invoiceRepository.countByUserAndStatus(user, "paid");
        long countUnpaid = invoiceRepository.countByUserAndStatus(user, "unpaid");
        long countCancelled = invoiceRepository.countByUserAndStatus(user, "cancelled");
        long countOverdue = invoiceRepository.countOverdueByUser(user, today);
        long countTotal = countPaid + countUnpaid + countCancelled;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total_invoiced", totalInvoiced);
        stats.put("total_paid", totalPaid);
        stats.put("total_outstanding", totalOutstanding);
        stats.put("total_overdue", totalOverdue);
        stats.put("invoice_count", Map.of(
            "total", countTotal,
            "paid", countPaid,
            "unpaid", countUnpaid,
            "overdue", countOverdue,
            "cancelled", countCancelled
        ));
        return stats;
    }

    @Transactional
    public Map<String, Object> create(User user, Map<String, Object> body) {
        boolean vatRegistered = userTaxProfileRepository.findByUser(user)
            .map(UserTaxProfile::getVatRegistered)
            .orElse(false);

        BigDecimal subtotal = new BigDecimal(body.get("subtotal").toString());
        BigDecimal vatAmount = vatRegistered
            ? subtotal.multiply(VAT_RATE).setScale(2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(vatAmount);

        Invoice invoice = new Invoice();
        invoice.setUser(user);
        invoice.setClientName((String) body.get("client_name"));
        invoice.setClientEmail((String) body.get("client_email"));
        invoice.setClientPhone((String) body.get("client_phone"));
        invoice.setDescription((String) body.get("description"));
        invoice.setSubtotal(subtotal);
        invoice.setVatAmount(vatAmount);
        invoice.setTotalAmount(totalAmount);
        if (body.get("due_date") != null) {
            invoice.setDueDate(LocalDate.parse((String) body.get("due_date")));
        }

        String ref = generateRef(user);
        invoice.setInvoiceRef(ref);

        invoice = invoiceRepository.save(invoice);

        String pdfUrl = generateAndUploadPdf(invoice);
        invoice.setPdfUrl(pdfUrl);
        invoice = invoiceRepository.save(invoice);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("invoice_id", invoice.getInvoiceId());
        result.put("invoice_ref", invoice.getInvoiceRef());
        result.put("client_name", invoice.getClientName());
        result.put("subtotal", invoice.getSubtotal());
        result.put("vat_amount", invoice.getVatAmount());
        result.put("total_amount", invoice.getTotalAmount());
        result.put("status", invoice.getStatus());
        result.put("pdf_url", invoice.getPdfUrl());
        result.put("created_at", invoice.getCreatedAt());
        return result;
    }

    public Map<String, Object> getInvoice(User user, UUID id) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        return toDetail(invoice);
    }

    @Transactional
    public Map<String, Object> update(User user, UUID id, Map<String, Object> body) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        if (!"unpaid".equals(invoice.getStatus())) {
            throw new BadRequestException("Only unpaid invoices can be edited");
        }

        boolean vatRegistered = userTaxProfileRepository.findByUser(user)
            .map(UserTaxProfile::getVatRegistered)
            .orElse(false);

        if (body.get("client_name") != null) invoice.setClientName((String) body.get("client_name"));
        if (body.get("client_email") != null) invoice.setClientEmail((String) body.get("client_email"));
        if (body.get("client_phone") != null) invoice.setClientPhone((String) body.get("client_phone"));
        if (body.get("description") != null) invoice.setDescription((String) body.get("description"));
        if (body.get("due_date") != null) invoice.setDueDate(LocalDate.parse((String) body.get("due_date")));

        if (body.get("subtotal") != null) {
            BigDecimal subtotal = new BigDecimal(body.get("subtotal").toString());
            BigDecimal vatAmount = vatRegistered
                ? subtotal.multiply(VAT_RATE).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
            invoice.setSubtotal(subtotal);
            invoice.setVatAmount(vatAmount);
            invoice.setTotalAmount(subtotal.add(vatAmount));
        }

        invoice = invoiceRepository.save(invoice);
        String pdfUrl = generateAndUploadPdf(invoice);
        invoice.setPdfUrl(pdfUrl);
        invoice = invoiceRepository.save(invoice);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("invoice_id", invoice.getInvoiceId());
        result.put("invoice_ref", invoice.getInvoiceRef());
        result.put("subtotal", invoice.getSubtotal());
        result.put("vat_amount", invoice.getVatAmount());
        result.put("total_amount", invoice.getTotalAmount());
        result.put("pdf_url", invoice.getPdfUrl());
        result.put("updated_at", invoice.getUpdatedAt());
        return result;
    }

    @Transactional
    public Map<String, Object> markPaid(User user, UUID id, Map<String, Object> body) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        if (!"unpaid".equals(invoice.getStatus())) {
            throw new BadRequestException("Only unpaid invoices can be marked as paid");
        }

        LocalDateTime paidAt = body.get("paid_at") != null
            ? LocalDateTime.parse((String) body.get("paid_at"))
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

        invoice.setStatus("paid");
        invoice.setPaidAt(paidAt);
        invoice.setTransaction(tx);
        invoiceRepository.save(invoice);

        notificationService.send(user,
            "Invoice Paid",
            "Invoice " + invoice.getInvoiceRef() + " has been marked as paid.",
            NotificationType.PAYMENT, null);

        BigDecimal suggested = invoice.getSubtotal()
            .multiply(TAX_SUGGESTION_RATE).setScale(2, RoundingMode.HALF_UP);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("invoice_id", invoice.getInvoiceId());
        result.put("invoice_ref", invoice.getInvoiceRef());
        result.put("status", "paid");
        result.put("paid_at", paidAt);
        result.put("transaction_created", true);
        result.put("transaction_id", tx.getTransactionId());
        result.put("tax_liability_updated", true);
        result.put("vault_suggestion", Map.of(
            "suggested", true,
            "suggested_amount", suggested,
            "message", "Consider saving GHS " + suggested + " for taxes on this income"
        ));
        return result;
    }

    @Transactional
    public Map<String, Object> cancel(User user, UUID id, Map<String, Object> body) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        if (!"unpaid".equals(invoice.getStatus())) {
            throw new BadRequestException("Only unpaid invoices can be cancelled");
        }

        invoice.setStatus("cancelled");
        invoice.setCancelledAt(LocalDateTime.now());
        if (body != null && body.get("reason") != null) {
            invoice.setCancelReason((String) body.get("reason"));
        }
        invoiceRepository.save(invoice);

        return Map.of(
            "invoice_id", invoice.getInvoiceId(),
            "invoice_ref", invoice.getInvoiceRef(),
            "status", "cancelled",
            "cancelled_at", invoice.getCancelledAt()
        );
    }

    public Map<String, Object> getPdfUrl(User user, UUID id) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        return Map.of(
            "invoice_id", invoice.getInvoiceId(),
            "invoice_ref", invoice.getInvoiceRef(),
            "pdf_url", invoice.getPdfUrl() != null ? invoice.getPdfUrl() : ""
        );
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

    private byte[] fetchPdfBytes(Invoice invoice) {
        try {
            java.net.URL url = new java.net.URI(invoice.getPdfUrl()).toURL();
            return url.openStream().readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch PDF: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> send(User user, UUID id, String channel) {
        Invoice invoice = invoiceRepository.findByInvoiceIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));

        invoice.setSentVia(channel);
        invoice.setSentAt(LocalDateTime.now());
        invoiceRepository.save(invoice);

        Map<String, Object> delivery = new LinkedHashMap<>();
        if ("whatsapp".equals(channel) && invoice.getClientPhone() != null) {
            String phone = invoice.getClientPhone().replaceAll("[^0-9]", "");
            String message = "Hello " + invoice.getClientName() + ", please find your invoice "
                + invoice.getInvoiceRef() + " here: " + invoice.getPdfUrl();
            delivery.put("whatsapp_link", "https://wa.me/" + phone + "?text=" + message);
            delivery.put("download_url", null);
        } else if ("email".equals(channel) && invoice.getClientEmail() != null) {
            emailService.sendInvoice(
                invoice.getClientEmail(),
                invoice.getClientName(),
                invoice.getInvoiceRef(),
                invoice.getTotalAmount().toPlainString(),
                baseUrl + "/api/v1/invoices/" + invoice.getInvoiceId() + "/pdf/download",
                user.getFullName(),
                user.getEmail()
            );
            delivery.put("whatsapp_link", null);
            delivery.put("download_url", null);
        } else {
            delivery.put("whatsapp_link", null);
            delivery.put("download_url", "/api/v1/invoices/" + invoice.getInvoiceId() + "/pdf/download");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("invoice_id", invoice.getInvoiceId());
        result.put("invoice_ref", invoice.getInvoiceRef());
        result.put("sent_via", channel);
        result.put("sent_to", Map.of(
            "name", invoice.getClientName() != null ? invoice.getClientName() : "",
            "email", invoice.getClientEmail() != null ? invoice.getClientEmail() : ""
        ));
        result.put("sent_at", invoice.getSentAt());
        result.put("delivery", delivery);
        return result;
    }

    // --- Helpers ---

    private String generateRef(User user) {
        int year = LocalDate.now().getYear();
        String prefix = "INV-" + year + "-";
        long count = invoiceRepository.countByUserAndInvoiceRefStartingWith(user, prefix);
        return String.format("%s%05d", prefix, count + 1);
    }

    private String generateAndUploadPdf(Invoice invoice) {
        byte[] pdfBytes = pdfService.generateInvoicePdf(invoice);
        return cloudinaryService.uploadPdf(pdfBytes, "invoices/" + invoice.getInvoiceRef() + ".pdf");
    }

    private Map<String, Object> toSummary(Invoice i) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("invoice_id", i.getInvoiceId());
        m.put("invoice_ref", i.getInvoiceRef());
        m.put("client_name", i.getClientName());
        m.put("total_amount", i.getTotalAmount());
        m.put("status", i.getStatus());
        m.put("due_date", i.getDueDate());
        m.put("created_at", i.getCreatedAt());
        return m;
    }

    private Map<String, Object> toDetail(Invoice i) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("invoice_id", i.getInvoiceId());
        m.put("invoice_ref", i.getInvoiceRef());
        m.put("client_name", i.getClientName());
        m.put("client_email", i.getClientEmail());
        m.put("client_phone", i.getClientPhone());
        m.put("description", i.getDescription());
        m.put("subtotal", i.getSubtotal());
        m.put("vat_amount", i.getVatAmount());
        m.put("total_amount", i.getTotalAmount());
        m.put("status", i.getStatus());
        m.put("due_date", i.getDueDate());
        m.put("paid_at", i.getPaidAt());
        m.put("sent_via", i.getSentVia());
        m.put("pdf_url", i.getPdfUrl());
        m.put("created_at", i.getCreatedAt());
        m.put("updated_at", i.getUpdatedAt());
        return m;
    }
}
