package com.taxpadi.api.service;

import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.taxpadi.api.dto.certificate.*;
import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.ComplianceCertificate;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.ComplianceCertificateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplianceCertificateService {

    private final ComplianceCertificateRepository repo;
    private final CloudinaryService cloudinaryService;

    public ComplianceCertificateService(ComplianceCertificateRepository repo,
                                        CloudinaryService cloudinaryService) {
        this.repo = repo;
        this.cloudinaryService = cloudinaryService;
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

    @Transactional
    public CertificateDownloadDto getDownloadUrl(UUID certificateId, User user) {
        ComplianceCertificate c = repo.findById(certificateId)
                .orElseThrow(() -> new NotFoundException("No certificate found with this ID."));
        if (!c.getUser().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException("You do not have access to this certificate.");
        }

        String pdfUrl = c.getDownloadUrl();
        if (pdfUrl == null) {
            byte[] pdf = buildCertificatePdf(c, user);
            String publicId = "certificates/" + user.getUserId() + "/" + c.getCertificateNumber();
            pdfUrl = cloudinaryService.uploadPdf(pdf, publicId);
            c.setDownloadUrl(pdfUrl);
            repo.save(c);
        }

        CertificateDownloadDto dto = new CertificateDownloadDto();
        dto.setCertificateId(c.getCertificateId());
        dto.setDocumentRef(c.getCertificateNumber());
        dto.setPdfUrl(pdfUrl);
        dto.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        return dto;
    }

    // Design palette
    private static final DeviceRgb NAVY  = new DeviceRgb(0x00, 0x2B, 0x5C);
    private static final DeviceRgb GOLD  = new DeviceRgb(0xC8, 0xA9, 0x51);
    private static final DeviceRgb PALE  = new DeviceRgb(0xF4, 0xF6, 0xFA);
    private static final DeviceRgb DARK  = new DeviceRgb(0x1A, 0x1A, 0x2E);
    private static final DeviceRgb MUTED = new DeviceRgb(0x5A, 0x5A, 0x7A);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("d MMMM yyyy");

    private byte[] buildCertificatePdf(ComplianceCertificate c, User user) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(new PdfDocument(new PdfWriter(out)), PageSize.A4);
        doc.setMargins(0, 0, 30, 0);

        // ── HEADER BLOCK ─────────────────────────────────────────────────────
        Table header = new Table(1).setWidth(UnitValue.createPercentValue(100)).setBorder(Border.NO_BORDER);

        Cell top = new Cell().setBackgroundColor(NAVY).setPadding(28).setBorder(Border.NO_BORDER);
        top.add(new Paragraph("GHANA REVENUE AUTHORITY")
                .setFontColor(ColorConstants.WHITE).setBold().setFontSize(17)
                .setTextAlignment(TextAlignment.CENTER).setMarginBottom(3));
        top.add(new Paragraph("TAX COMPLIANCE CERTIFICATE")
                .setFontColor(GOLD).setBold().setFontSize(11)
                .setTextAlignment(TextAlignment.CENTER).setCharacterSpacing(1.5f));
        header.addCell(top);

        // Gold accent bar
        header.addCell(new Cell().setBackgroundColor(GOLD).setHeight(5).setBorder(Border.NO_BORDER));
        doc.add(header);

        // ── BODY (with horizontal padding) ───────────────────────────────────
        doc.setLeftMargin(50);
        doc.setRightMargin(50);

        doc.add(new Paragraph(" ").setMarginBottom(6));

        // Certificate number badge
        doc.add(new Paragraph(c.getCertificateNumber())
                .setFontColor(NAVY).setBold().setFontSize(11)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(18));

        // Thin gold rule
        doc.add(new Table(1).setWidth(UnitValue.createPercentValue(60))
                .setHorizontalAlignment(HorizontalAlignment.CENTER).setBorder(Border.NO_BORDER)
                .addCell(new Cell().setBackgroundColor(GOLD).setHeight(1).setBorder(Border.NO_BORDER)));

        doc.add(new Paragraph(" ").setMarginBottom(6));

        // ── CERTIFICATION STATEMENT ───────────────────────────────────────────
        String taxLabel = titleCase(c.getCertificateType().replace("_", " ").replace("-", " "));
        String tin      = c.getTinNumber() != null ? c.getTinNumber() : user.getTin();

        doc.add(new Paragraph("This is to certify that")
                .setFontColor(MUTED).setFontSize(10.5f).setTextAlignment(TextAlignment.CENTER).setMarginBottom(4));

        doc.add(new Paragraph(user.getFullName().toUpperCase())
                .setFontColor(DARK).setBold().setFontSize(18)
                .setTextAlignment(TextAlignment.CENTER).setMarginBottom(2));

        if (tin != null) {
            doc.add(new Paragraph("TIN: " + tin)
                    .setFontColor(MUTED).setFontSize(9.5f)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(6));
        }

        doc.add(new Paragraph("has fulfilled their " + taxLabel + " tax obligations\nin accordance with the laws of the Republic of Ghana.")
                .setFontColor(MUTED).setFontSize(10.5f)
                .setTextAlignment(TextAlignment.CENTER).setMarginBottom(22));

        // ── DETAILS TABLE ─────────────────────────────────────────────────────
        Table details = new Table(new float[]{1, 1.6f})
                .setWidth(UnitValue.createPercentValue(90))
                .setHorizontalAlignment(HorizontalAlignment.CENTER)
                .setMarginBottom(26);

        String issueDate  = c.getIssueDate()  != null ? c.getIssueDate().format(DATE_FMT)  : LocalDate.now().format(DATE_FMT);
        String expiryDate = c.getExpiryDate() != null ? c.getExpiryDate().format(DATE_FMT) : "N/A";
        String issuedBy   = c.getIssuedBy()   != null ? c.getIssuedBy() : "Ghana Revenue Authority";

        addDetailRow(details, "Tax Type",           taxLabel,                   false);
        addDetailRow(details, "Certificate Number", c.getCertificateNumber(),   true);
        addDetailRow(details, "Taxpayer Name",       user.getFullName(),         false);
        addDetailRow(details, "Phone",               user.getPhone(),            true);
        if (tin != null)
            addDetailRow(details, "TIN",             tin,                        false);
        addDetailRow(details, "Issue Date",          issueDate,                  tin != null);
        addDetailRow(details, "Valid Until",         expiryDate,                 tin == null);
        addDetailRow(details, "Issued By",           issuedBy,                   tin != null);
        addDetailRow(details, "Status",              c.getStatus().toUpperCase(), tin == null);

        doc.add(details);

        // ── FOOTER RULE ───────────────────────────────────────────────────────
        doc.add(new Table(1).setWidth(UnitValue.createPercentValue(60))
                .setHorizontalAlignment(HorizontalAlignment.CENTER).setBorder(Border.NO_BORDER)
                .addCell(new Cell().setBackgroundColor(NAVY).setHeight(1).setBorder(Border.NO_BORDER)));

        doc.add(new Paragraph(" ").setMarginBottom(5));

        doc.add(new Paragraph("This certificate is computer-generated and valid without a physical signature.")
                .setFontColor(MUTED).setFontSize(7.5f).setTextAlignment(TextAlignment.CENTER).setMarginBottom(2));
        doc.add(new Paragraph("Verify authenticity at taxpadi.com  ·  Ghana Revenue Authority, Accra, Ghana")
                .setFontColor(MUTED).setFontSize(7.5f).setTextAlignment(TextAlignment.CENTER));

        doc.setLeftMargin(0);
        doc.setRightMargin(0);

        // ── FOOTER BAR ────────────────────────────────────────────────────────
        Table footer = new Table(1).setWidth(UnitValue.createPercentValue(100)).setBorder(Border.NO_BORDER);
        footer.addCell(new Cell().setBackgroundColor(GOLD).setHeight(5).setBorder(Border.NO_BORDER));
        footer.addCell(new Cell().setBackgroundColor(NAVY).setHeight(10).setBorder(Border.NO_BORDER));
        doc.add(footer);

        doc.close();
        return out.toByteArray();
    }

    private void addDetailRow(Table table, String label, String value, boolean shade) {
        Color bg = shade ? PALE : ColorConstants.WHITE;
        table.addCell(new Cell()
                .setBackgroundColor(NAVY).setPadding(9).setBorder(Border.NO_BORDER)
                .add(new Paragraph(label).setFontColor(ColorConstants.WHITE).setBold().setFontSize(9)));
        table.addCell(new Cell()
                .setBackgroundColor(bg).setPadding(9).setBorder(Border.NO_BORDER)
                .add(new Paragraph(value != null ? value : "N/A").setFontColor(DARK).setFontSize(10)));
    }

    private String titleCase(String input) {
        String[] words = input.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0)))
                  .append(w.substring(1).toLowerCase())
                  .append(" ");
            }
        }
        return sb.toString().trim();
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
