package com.taxpadi.api.service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.taxpadi.api.model.Invoice;

@Service
public class PdfService {

    private static final DeviceRgb BRAND_RED = new DeviceRgb(184, 55, 41);
    private static final DeviceRgb TEAL      = new DeviceRgb(13, 99, 104);   // header bg
    private static final DeviceRgb TEAL_DARK = new DeviceRgb(9,  72,  76);   // items header bg
    private static final DeviceRgb DARK      = new DeviceRgb(30, 30, 40);    // body text
    private static final DeviceRgb MUTED     = new DeviceRgb(100, 110, 120); // secondary text
    private static final DeviceRgb PALE      = new DeviceRgb(245, 248, 248); // card bg (slight teal tint)
    private static final DeviceRgb DIVIDER   = new DeviceRgb(210, 222, 222); // borders
    private static final float H_PAD = 50f;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("d MMM yyyy");

    public byte[] generateInvoicePdf(Invoice invoice) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(new PdfWriter(out));
        // Footer bars drawn at absolute page bottom via event handler
        pdfDoc.addEventHandler(PdfDocumentEvent.END_PAGE, new FooterBarHandler());

        Document doc = new Document(pdfDoc, PageSize.A4);
        // Side margins set upfront so ALL body content inherits them automatically.
        // Full-bleed header/bars compensate with negative margins + fixed page width.
        float pageWidth = PageSize.A4.getWidth();
        doc.setMargins(0, H_PAD, 30, H_PAD);

        // ── FULL-BLEED TEAL HEADER ────────────────────────────────────────────
        Table header = new Table(new float[]{1, 1})
                .setWidth(pageWidth)
                .setMarginLeft(-H_PAD).setMarginRight(-H_PAD)
                .setBorder(Border.NO_BORDER);

        Cell logoCell = new Cell().setBackgroundColor(TEAL).setBorder(Border.NO_BORDER)
                .setPaddingLeft(H_PAD).setPaddingTop(40).setPaddingBottom(40).setPaddingRight(20)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);
        try (InputStream is = getClass().getResourceAsStream("/images/logo.png")) {
            if (is != null) {
                logoCell.add(new Image(ImageDataFactory.create(is.readAllBytes())).setWidth(130));
            } else {
                logoCell.add(new Paragraph("TaxPadi").setBold().setFontSize(26).setFontColor(ColorConstants.WHITE));
            }
        } catch (Exception ignored) {
            logoCell.add(new Paragraph("TaxPadi").setBold().setFontSize(26).setFontColor(ColorConstants.WHITE));
        }
        header.addCell(logoCell);

        Cell titleCell = new Cell().setBackgroundColor(TEAL).setBorder(Border.NO_BORDER)
                .setPaddingRight(H_PAD).setPaddingTop(40).setPaddingBottom(40).setPaddingLeft(20)
                .setTextAlignment(TextAlignment.RIGHT).setVerticalAlignment(VerticalAlignment.MIDDLE);
        titleCell.add(new Paragraph("TAX INVOICE")
                .setFontColor(ColorConstants.WHITE).setBold().setFontSize(28).setMarginBottom(8));
        titleCell.add(new Paragraph(invoice.getInvoiceRef())
                .setFontColor(ColorConstants.WHITE).setBold().setFontSize(13).setMarginBottom(5));
        titleCell.add(new Paragraph("Date:  " + invoice.getCreatedAt().format(DATE_FMT))
                .setFontColor(new DeviceRgb(180, 215, 218)).setFontSize(10).setMarginBottom(3));
        if (invoice.getDueDate() != null) {
            titleCell.add(new Paragraph("Due:   " + invoice.getDueDate().format(DATE_FMT))
                    .setFontColor(new DeviceRgb(180, 215, 218)).setFontSize(10));
        }
        header.addCell(titleCell);
        doc.add(header);

        // Accent bar — full bleed, same negative-margin trick
        doc.add(new Table(1).setWidth(pageWidth).setMarginLeft(-H_PAD).setMarginRight(-H_PAD)
                .setBorder(Border.NO_BORDER)
                .addCell(new Cell().setBackgroundColor(BRAND_RED).setHeight(6).setBorder(Border.NO_BORDER)));

        // ── BODY — all content inherits H_PAD side margins from doc ───────────
        doc.add(new Paragraph(" ").setMarginBottom(18));

        // Status dot + label
        String status = invoice.getStatus() != null ? invoice.getStatus().toUpperCase() : "UNPAID";
        DeviceRgb statusColor = "PAID".equals(status) ? new DeviceRgb(39, 174, 96)
                : ("CANCELLED".equals(status) ? new DeviceRgb(140, 140, 140) : BRAND_RED);
        doc.add(new Paragraph("● " + status)
                .setFontColor(statusColor).setBold().setFontSize(12).setMarginBottom(22));

        // ── FROM / BILL TO cards ──────────────────────────────────────────────
        Table parties = new Table(new float[]{1, 1})
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(Border.NO_BORDER).setMarginBottom(32);

        Cell fromCell = new Cell().setBorder(Border.NO_BORDER)
                .setBackgroundColor(PALE).setPadding(22).setPaddingRight(28)
                .setBorderRight(new SolidBorder(DIVIDER, 1));
        fromCell.add(caps("FROM"));
        String sender = invoice.getUser() != null ? invoice.getUser().getFullName() : "TaxPadi";
        fromCell.add(new Paragraph(sender).setFontColor(DARK).setBold().setFontSize(14).setMarginBottom(5));
        if (invoice.getUser() != null && invoice.getUser().getPhone() != null) {
            fromCell.add(new Paragraph(invoice.getUser().getPhone()).setFontColor(MUTED).setFontSize(10.5f));
        }
        parties.addCell(fromCell);

        Cell toCell = new Cell().setBorder(Border.NO_BORDER)
                .setBackgroundColor(PALE).setPadding(22).setPaddingLeft(28)
                .setBorderLeft(new SolidBorder(BRAND_RED, 3));
        toCell.add(caps("BILL TO"));
        toCell.add(new Paragraph(invoice.getClientName()).setFontColor(DARK).setBold().setFontSize(14).setMarginBottom(5));
        if (invoice.getClientEmail() != null) {
            toCell.add(new Paragraph(invoice.getClientEmail()).setFontColor(MUTED).setFontSize(10.5f).setMarginBottom(3));
        }
        if (invoice.getClientPhone() != null) {
            toCell.add(new Paragraph(invoice.getClientPhone()).setFontColor(MUTED).setFontSize(10.5f));
        }
        parties.addCell(toCell);
        doc.add(parties);

        // ── LINE ITEMS TABLE ──────────────────────────────────────────────────
        Table items = new Table(new float[]{5, 2})
                .setWidth(UnitValue.createPercentValue(100)).setMarginBottom(2);

        items.addHeaderCell(new Cell()
                .add(new Paragraph("DESCRIPTION").setBold().setFontSize(9).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(TEAL_DARK).setBorder(Border.NO_BORDER).setPadding(16));
        items.addHeaderCell(new Cell()
                .add(new Paragraph("AMOUNT (GHS)").setBold().setFontSize(9)
                        .setFontColor(ColorConstants.WHITE).setTextAlignment(TextAlignment.RIGHT))
                .setBackgroundColor(TEAL_DARK).setBorder(Border.NO_BORDER).setPadding(16));

        items.addCell(new Cell()
                .add(new Paragraph(invoice.getDescription() != null ? invoice.getDescription() : "")
                        .setFontColor(DARK).setFontSize(11.5f))
                .setBorder(Border.NO_BORDER).setBorderBottom(new SolidBorder(DIVIDER, 1)).setPadding(18));
        items.addCell(new Cell()
                .add(new Paragraph(fmt(invoice.getSubtotal())).setFontColor(DARK).setFontSize(11.5f)
                        .setTextAlignment(TextAlignment.RIGHT))
                .setBorder(Border.NO_BORDER).setBorderBottom(new SolidBorder(DIVIDER, 1)).setPadding(18));
        doc.add(items);

        // ── TOTALS BOX ───────────────────────────────────────────────────────
        Table totals = new Table(new float[]{3, 2})
                .setWidth(UnitValue.createPercentValue(48))
                .setHorizontalAlignment(HorizontalAlignment.RIGHT)
                .setMarginTop(0).setMarginBottom(36)
                .setBorder(new SolidBorder(DIVIDER, 1));

        addTotalRow(totals, "Subtotal", "GHS " + fmt(invoice.getSubtotal()), false);
        if (invoice.getVatAmount() != null && invoice.getVatAmount().compareTo(BigDecimal.ZERO) > 0) {
            addTotalRow(totals, "VAT", "GHS " + fmt(invoice.getVatAmount()), false);
        }
        // Red divider before total
        totals.addCell(new Cell(1, 2).setBackgroundColor(BRAND_RED)
                .setHeight(2).setBorder(Border.NO_BORDER).setPadding(0));
        addTotalRow(totals, "TOTAL DUE", "GHS " + fmt(invoice.getTotalAmount()), true);
        doc.add(totals);

        // Thank you note
        doc.add(new Paragraph("Thank you for your business.")
                .setFontColor(MUTED).setFontSize(10.5f).setItalic());

        doc.close();
        return out.toByteArray();
    }

    private void addTotalRow(Table table, String label, String value, boolean bold) {
        Color bg = bold ? ColorConstants.WHITE : PALE;
        Paragraph lp = new Paragraph(label).setFontColor(bold ? DARK : MUTED).setFontSize(bold ? 12 : 10f);
        Paragraph vp = new Paragraph(value).setFontColor(bold ? BRAND_RED : DARK)
                .setFontSize(bold ? 14 : 10f).setTextAlignment(TextAlignment.RIGHT);
        if (bold) { lp.setBold(); vp.setBold(); }
        table.addCell(new Cell().add(lp).setBackgroundColor(bg).setBorder(Border.NO_BORDER).setPadding(12));
        table.addCell(new Cell().add(vp).setBackgroundColor(bg).setBorder(Border.NO_BORDER).setPadding(12));
    }

    private Paragraph caps(String text) {
        return new Paragraph(text).setFontColor(MUTED).setFontSize(8f).setBold()
                .setCharacterSpacing(1.2f).setMarginBottom(8);
    }

    private String fmt(BigDecimal amount) {
        return amount != null ? String.format("%,.2f", amount) : "0.00";
    }

    /** Draws teal + brand-red bars pinned to the absolute bottom of every page. */
    private static class FooterBarHandler implements IEventHandler {
        @Override
        public void handleEvent(Event event) {
            PdfDocumentEvent e = (PdfDocumentEvent) event;
            PdfPage page = e.getPage();
            float w = page.getPageSize().getWidth();
            PdfCanvas canvas = new PdfCanvas(page);
            canvas.saveState()
                    .setFillColor(new DeviceRgb(9, 72, 76))   // teal base
                    .rectangle(0, 0, w, 10).fill()
                    .setFillColor(new DeviceRgb(184, 55, 41))  // brand red accent
                    .rectangle(0, 10, w, 5).fill()
                    .restoreState();
        }
    }
}