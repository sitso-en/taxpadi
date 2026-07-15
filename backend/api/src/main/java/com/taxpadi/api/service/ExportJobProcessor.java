package com.taxpadi.api.service;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.UnitValue;
import java.io.InputStream;
import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.Transaction;
import com.taxpadi.api.model.User;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;

@Component
public class ExportJobProcessor {

    private static final Logger log = LoggerFactory.getLogger(ExportJobProcessor.class);

    private final CloudinaryService cloudinaryService;
    private final StringRedisTemplate redis;

    public ExportJobProcessor(CloudinaryService cloudinaryService, StringRedisTemplate redis) {
        this.cloudinaryService = cloudinaryService;
        this.redis = redis;
    }

    @Async
    public void process(String jobId, User user, String format,
                        LocalDate dateFrom, LocalDate dateTo,
                        List<Transaction> transactions, List<TaxReturn> taxReturns) {
        String key = "export:" + jobId;
        try {
            String publicId = "exports/" + user.getUserId() + "/taxpadi-data-export-" + dateFrom + "-to-" + dateTo;
            String fileUrl;
            if ("pdf".equals(format)) {
                byte[] bytes = buildPdf(user, dateFrom, dateTo, transactions, taxReturns);
                fileUrl = cloudinaryService.uploadPdf(bytes, publicId + ".pdf", "taxpadi-report-data.pdf");
            } else {
                byte[] bytes = buildExcel(transactions, taxReturns);
                fileUrl = cloudinaryService.uploadPdf(bytes, publicId + ".xlsx", "taxpadi-report-data.xlsx");
            }
            redis.opsForValue().set(key, "{\"status\":\"done\",\"fileUrl\":\"" + fileUrl + "\"}", Duration.ofHours(1));
        } catch (Exception e) {
            log.error("Export job {} failed: {}", jobId, e.getMessage());
            redis.opsForValue().set(key, "{\"status\":\"failed\",\"error\":\"Export generation failed\"}", Duration.ofHours(1));
        }
    }

    private byte[] buildExcel(List<Transaction> transactions, List<TaxReturn> taxReturns) throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_RED.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont font = workbook.createFont();
            font.setColor(IndexedColors.WHITE.getIndex());
            font.setBold(true);
            headerStyle.setFont(font);

            XSSFSheet txSheet = workbook.createSheet("Transactions");
            String[] txHeaders = {"Date", "Type", "Amount (GHS)", "Category", "Description", "Tax Deductible", "WHT Amount"};
            XSSFRow txHead = txSheet.createRow(0);
            for (int i = 0; i < txHeaders.length; i++) {
                var cell = txHead.createCell(i);
                cell.setCellValue(txHeaders[i]);
                cell.setCellStyle(headerStyle);
                txSheet.setColumnWidth(i, 5000);
            }
            int txRow = 1;
            for (Transaction t : transactions) {
                XSSFRow row = txSheet.createRow(txRow++);
                row.createCell(0).setCellValue(t.getTransactionDate().toString());
                row.createCell(1).setCellValue(t.getType());
                row.createCell(2).setCellValue(t.getAmount().doubleValue());
                row.createCell(3).setCellValue(t.getCategory() != null ? t.getCategory() : "");
                row.createCell(4).setCellValue(t.getDescription() != null ? t.getDescription() : "");
                row.createCell(5).setCellValue(Boolean.TRUE.equals(t.getTaxDeductible()) ? "Yes" : "No");
                row.createCell(6).setCellValue(t.getWithholdingAmount() != null ? t.getWithholdingAmount().doubleValue() : 0);
            }

            XSSFSheet retSheet = workbook.createSheet("Tax Returns");
            String[] retHeaders = {"Tax Type", "Year", "Period Start", "Period End", "Status", "Tax Liability (GHS)", "Submitted At"};
            XSSFRow retHead = retSheet.createRow(0);
            for (int i = 0; i < retHeaders.length; i++) {
                var cell = retHead.createCell(i);
                cell.setCellValue(retHeaders[i]);
                cell.setCellStyle(headerStyle);
                retSheet.setColumnWidth(i, 5500);
            }
            int retRow = 1;
            for (TaxReturn r : taxReturns) {
                XSSFRow row = retSheet.createRow(retRow++);
                row.createCell(0).setCellValue(r.getTaxType());
                row.createCell(1).setCellValue(r.getTaxYear());
                row.createCell(2).setCellValue(r.getPeriodStart().toString());
                row.createCell(3).setCellValue(r.getPeriodEnd().toString());
                row.createCell(4).setCellValue(r.getStatus());
                row.createCell(5).setCellValue(r.getTaxLiability() != null ? r.getTaxLiability().doubleValue() : 0);
                row.createCell(6).setCellValue(r.getSubmittedAt() != null ? r.getSubmittedAt().toString() : "");
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private byte[] buildPdf(User user, LocalDate from, LocalDate to,
                            List<Transaction> transactions, List<TaxReturn> taxReturns) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf);

        try (InputStream is = getClass().getResourceAsStream("/images/logo.png")) {
            if (is != null) {
                Image logo = new Image(ImageDataFactory.create(is.readAllBytes()))
                        .setWidth(130).setHorizontalAlignment(HorizontalAlignment.LEFT);
                doc.add(logo);
            }
        } catch (Exception ignored) {}
        doc.add(new Paragraph("Financial Export Report").setFontSize(14).setFontColor(ColorConstants.DARK_GRAY));
        doc.add(new Paragraph("Taxpayer: " + user.getFullName()));
        doc.add(new Paragraph("Period: " + from + " to " + to));
        doc.add(new Paragraph("Generated: " + LocalDateTime.now().toLocalDate()));
        doc.add(new Paragraph(" "));

        if (!transactions.isEmpty()) {
            doc.add(new Paragraph("Transactions").setFontSize(13).setBold());
            Table table = new Table(UnitValue.createPercentArray(new float[]{15, 10, 15, 20, 30, 10}))
                .setWidth(UnitValue.createPercentValue(100));
            for (String h : new String[]{"Date", "Type", "Amount", "Category", "Description", "Tax Ded."}) {
                table.addHeaderCell(new Cell().add(new Paragraph(h).setBold())
                    .setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(184, 55, 41))
                    .setFontColor(ColorConstants.WHITE));
            }
            for (Transaction t : transactions) {
                table.addCell(t.getTransactionDate().toString());
                table.addCell(t.getType());
                table.addCell("GHS " + t.getAmount().setScale(2, RoundingMode.HALF_UP));
                table.addCell(t.getCategory() != null ? t.getCategory() : "");
                table.addCell(t.getDescription() != null ? t.getDescription() : "");
                table.addCell(Boolean.TRUE.equals(t.getTaxDeductible()) ? "Yes" : "No");
            }
            doc.add(table);
            doc.add(new Paragraph(" "));
        }

        if (!taxReturns.isEmpty()) {
            doc.add(new Paragraph("Tax Returns").setFontSize(13).setBold());
            Table table = new Table(UnitValue.createPercentArray(new float[]{20, 10, 15, 15, 20, 20}))
                .setWidth(UnitValue.createPercentValue(100));
            for (String h : new String[]{"Tax Type", "Year", "Period Start", "Period End", "Status", "Liability (GHS)"}) {
                table.addHeaderCell(new Cell().add(new Paragraph(h).setBold())
                    .setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(184, 55, 41))
                    .setFontColor(ColorConstants.WHITE));
            }
            for (TaxReturn r : taxReturns) {
                table.addCell(r.getTaxType());
                table.addCell(String.valueOf(r.getTaxYear()));
                table.addCell(r.getPeriodStart().toString());
                table.addCell(r.getPeriodEnd().toString());
                table.addCell(r.getStatus());
                table.addCell(r.getTaxLiability() != null ? "GHS " + r.getTaxLiability().setScale(2, RoundingMode.HALF_UP) : "-");
            }
            doc.add(table);
        }

        doc.close();
        return out.toByteArray();
    }
}
