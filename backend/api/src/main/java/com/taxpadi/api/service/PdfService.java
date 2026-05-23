package com.taxpadi.api.service;                                                              
                                                                                            
import java.io.ByteArrayOutputStream;                                                         
import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.taxpadi.api.model.Invoice;

@Service
public class PdfService {

    public byte[] generateInvoicePdf(Invoice invoice) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf);

        doc.add(new Paragraph("TaxPadi")
            .setFontSize(24)
            .setBold()
            .setFontColor(ColorConstants.DARK_GRAY));
        doc.add(new Paragraph("TAX INVOICE")
            .setFontSize(14)
            .setFontColor(ColorConstants.GRAY));
        doc.add(new Paragraph(" "));

        doc.add(new Paragraph("Invoice Ref: " + invoice.getInvoiceRef()).setBold());
        doc.add(new Paragraph("Date: " + invoice.getCreatedAt().toLocalDate()));
        if (invoice.getDueDate() != null) {
            doc.add(new Paragraph("Due Date: " + invoice.getDueDate()));
        }
        doc.add(new Paragraph(" "));

        doc.add(new Paragraph("Bill To:").setBold());
        doc.add(new Paragraph(invoice.getClientName()));
        if (invoice.getClientEmail() != null) doc.add(new Paragraph(invoice.getClientEmail()));
        if (invoice.getClientPhone() != null) doc.add(new Paragraph(invoice.getClientPhone()));
        doc.add(new Paragraph(" "));

        Table table = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
            .setWidth(UnitValue.createPercentValue(100));

        table.addHeaderCell(headerCell("Description"));
        table.addHeaderCell(headerCell("Amount (GHS)"));
        table.addCell(new Cell().add(new Paragraph(invoice.getDescription())));
        table.addCell(new Cell().add(new Paragraph(formatAmount(invoice.getSubtotal()))
            .setTextAlignment(TextAlignment.RIGHT)));

        doc.add(table);
        doc.add(new Paragraph(" "));

        Table totals = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
            .setWidth(UnitValue.createPercentValue(100));

        totals.addCell(borderlessCell("Subtotal"));
        totals.addCell(borderlessCell("GHS " + formatAmount(invoice.getSubtotal()),TextAlignment.RIGHT));

        if (invoice.getVatAmount().compareTo(BigDecimal.ZERO) > 0) {
            totals.addCell(borderlessCell("VAT (21%)"));
            totals.addCell(borderlessCell("GHS " + formatAmount(invoice.getVatAmount()),TextAlignment.RIGHT));
        }

        totals.addCell(new Cell().add(new Paragraph("TOTAL").setBold()));
        totals.addCell(new Cell().add(new Paragraph("GHS " +formatAmount(invoice.getTotalAmount()))
            .setBold().setTextAlignment(TextAlignment.RIGHT)));

        doc.add(totals);
        doc.add(new Paragraph(" "));
        doc.add(new Paragraph("Thank you for your business.")
            .setItalic()
            .setFontColor(ColorConstants.GRAY));

        doc.close();
        return out.toByteArray();
    }

    private Cell headerCell(String text) {
        return new Cell().add(new Paragraph(text).setBold())
            .setBackgroundColor(ColorConstants.LIGHT_GRAY);
    }

    private Cell borderlessCell(String text) {
        return borderlessCell(text, TextAlignment.LEFT);
    }

    private Cell borderlessCell(String text, TextAlignment alignment) {
        return new Cell().add(new Paragraph(text).setTextAlignment(alignment))
            .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
    }

    private String formatAmount(BigDecimal amount) {
        return String.format("%.2f", amount);
    }
}