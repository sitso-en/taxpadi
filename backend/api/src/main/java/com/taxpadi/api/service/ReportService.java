package com.taxpadi.api.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.taxpadi.api.dto.report.Averages;
import com.taxpadi.api.dto.report.CategoryTotal;
import com.taxpadi.api.dto.report.ExportResponse;
import com.taxpadi.api.dto.report.ExpenseBreakdown;
import com.taxpadi.api.dto.report.IncomeBreakdown;
import com.taxpadi.api.dto.report.IncomeStatementResponse;
import com.taxpadi.api.dto.report.MonthlySummaryItem;
import com.taxpadi.api.dto.report.RecordsIncluded;
import com.taxpadi.api.dto.report.ReportTaxHistoryResponse;
import com.taxpadi.api.dto.report.SummaryResponse;
import com.taxpadi.api.dto.report.TaxCompliance;
import com.taxpadi.api.dto.report.TaxLiabilityBreakdown;
import com.taxpadi.api.dto.report.TaxTypeEntry;
import com.taxpadi.api.dto.report.TaxpayerSummary;
import com.taxpadi.api.dto.report.YearHistoryEntry;
import com.taxpadi.api.constant.TaxReturnStatus;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.TaxCalculation;
import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.Transaction;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.TaxCalculationRepository;
import com.taxpadi.api.repository.TaxReturnRepository;
import com.taxpadi.api.repository.TransactionRepository;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final TaxCalculationRepository taxCalculationRepository;
    private final TaxReturnRepository taxReturnRepository;
    private final CloudinaryService cloudinaryService;

    public ReportService(TransactionRepository transactionRepository,
                         TaxCalculationRepository taxCalculationRepository,
                         TaxReturnRepository taxReturnRepository,
                         CloudinaryService cloudinaryService) {
        this.transactionRepository = transactionRepository;
        this.taxCalculationRepository = taxCalculationRepository;
        this.taxReturnRepository = taxReturnRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public SummaryResponse getSummary(User user, String period, LocalDate dateFrom, LocalDate dateTo) {
        LocalDate[] range = resolveDateRange(period, dateFrom, dateTo);
        LocalDate from = range[0];
        LocalDate to   = range[1];

        BigDecimal incomeTotal  = nvl(transactionRepository.sumAmountByUserAndTypeAndDateRange(user, "income",  from, to));
        BigDecimal expenseTotal = nvl(transactionRepository.sumAmountByUserAndTypeAndDateRange(user, "expense", from, to));
        BigDecimal deductible   = nvl(transactionRepository.sumDeductibleExpensesByUserAndDateRange(user, from, to));
        BigDecimal netProfit    = incomeTotal.subtract(expenseTotal);

        List<Object[]> incomeRows  = transactionRepository.sumByCategoryAndType(user, "income",  from, to);
        List<Object[]> expenseRows = transactionRepository.sumByCategoryAndType(user, "expense", from, to);

        BigDecimal incomeTax = BigDecimal.ZERO;
        LocalDate yearStart = LocalDate.of(from.getYear(), 1, 1);
        LocalDate yearEnd   = LocalDate.of(from.getYear(), 12, 31);
        Optional<TaxCalculation> calc = taxCalculationRepository
            .findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(user, "income_tax", yearStart, yearEnd);
        if (calc.isPresent()) {
            incomeTax = nvl(calc.get().getTaxLiability());
        }

        SummaryResponse response = new SummaryResponse();
        response.setPeriodStart(from);
        response.setPeriodEnd(to);
        response.setIncome(new IncomeBreakdown(incomeTotal, categoryList(incomeRows)));
        response.setExpenses(new ExpenseBreakdown(expenseTotal, deductible, categoryList(expenseRows)));
        response.setNetProfit(netProfit);
        response.setTaxLiability(new TaxLiabilityBreakdown(incomeTax, BigDecimal.ZERO, incomeTax));
        return response;
    }

    public ExportResponse exportData(User user, String format, LocalDate dateFrom, LocalDate dateTo,
                                     boolean includeTransactions, boolean includeTaxReturns) {
        if (ChronoUnit.DAYS.between(dateFrom, dateTo) > 3 * 365L) {
            throw new BadRequestException("Export date range cannot exceed 3 years.");
        }
        if (!List.of("json", "pdf", "excel").contains(format)) {
            throw new BadRequestException("Format must be one of: json, pdf, excel.");
        }

        List<Transaction> transactions = includeTransactions
            ? transactionRepository.findAllByUserAndDateRange(user, dateFrom, dateTo)
            : List.of();
        List<TaxReturn> taxReturns = includeTaxReturns
            ? taxReturnRepository.findAllByUserAndYearRange(user, dateFrom.getYear(), dateTo.getYear())
            : List.of();

        ExportResponse response = new ExportResponse();
        response.setExportId(UUID.randomUUID());
        response.setFormat(format);
        response.setPeriodStart(dateFrom);
        response.setPeriodEnd(dateTo);
        response.setRecordsIncluded(new RecordsIncluded(transactions.size(), taxReturns.size(), 0, 0));

        String publicId = "exports/" + user.getUserId() + "/taxpadi-data-export-" + dateFrom + "-to-" + dateTo;
        try {
            switch (format) {
                case "pdf" -> {
                    byte[] bytes = buildPdf(user, dateFrom, dateTo, transactions, taxReturns);
                    response.setFileUrl(cloudinaryService.uploadPdf(bytes, publicId + ".pdf"));
                }
                case "excel" -> {
                    byte[] bytes = buildExcel(transactions, taxReturns);
                    response.setFileUrl(cloudinaryService.uploadPdf(bytes, publicId + ".xlsx"));
                }
                default -> {
                    Map<String, Object> data = buildJsonMap(user, dateFrom, dateTo, transactions, taxReturns);
                    response.setData(data);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate export: " + e.getMessage());
        }
        return response;
    }

    private Map<String, Object> buildJsonMap(User user, LocalDate from, LocalDate to,
                                              List<Transaction> transactions, List<TaxReturn> taxReturns) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("generated_at", LocalDateTime.now().toString());
        data.put("taxpayer", user.getFullName());
        data.put("period_start", from.toString());
        data.put("period_end", to.toString());

        data.put("transactions", transactions.stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", t.getTransactionDate().toString());
            m.put("type", t.getType());
            m.put("amount", t.getAmount());
            m.put("category", t.getCategory());
            m.put("description", t.getDescription());
            m.put("tax_deductible", t.getTaxDeductible());
            m.put("withholding_amount", t.getWithholdingAmount());
            return m;
        }).toList());

        data.put("tax_returns", taxReturns.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("tax_type", r.getTaxType());
            m.put("tax_year", r.getTaxYear());
            m.put("period_start", r.getPeriodStart().toString());
            m.put("period_end", r.getPeriodEnd().toString());
            m.put("status", r.getStatus());
            m.put("tax_liability", r.getTaxLiability());
            m.put("submitted_at", r.getSubmittedAt() != null ? r.getSubmittedAt().toString() : null);
            return m;
        }).toList());

        return data;
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

            // Transactions sheet
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

            // Tax Returns sheet
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

        doc.add(new Paragraph("TaxPadi").setFontSize(22).setBold().setFontColor(new com.itextpdf.kernel.colors.DeviceRgb(184, 55, 41)));
        doc.add(new Paragraph("Financial Export Report").setFontSize(14).setFontColor(ColorConstants.DARK_GRAY));
        doc.add(new Paragraph("Taxpayer: " + user.getFullName()));
        doc.add(new Paragraph("Period: " + from + " to " + to));
        doc.add(new Paragraph("Generated: " + LocalDateTime.now().toLocalDate()));
        doc.add(new Paragraph(" "));

        if (!transactions.isEmpty()) {
            doc.add(new Paragraph("Transactions").setFontSize(13).setBold());
            Table table = new Table(UnitValue.createPercentArray(new float[]{15, 10, 15, 20, 30, 10}))
                .setWidth(UnitValue.createPercentValue(100));
            for (String h : new String[]{"Date","Type","Amount","Category","Description","Tax Ded."}) {
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
            for (String h : new String[]{"Tax Type","Year","Period Start","Period End","Status","Liability (GHS)"}) {
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

    public IncomeStatementResponse getIncomeStatement(User user, int months) {
        if (months < 1 || months > 12) {
            throw new BadRequestException("Months must be between 1 and 12.");
        }

        LocalDate to   = LocalDate.now();
        LocalDate from = to.minusMonths(months).withDayOfMonth(1);

        BigDecimal totalIncome  = nvl(transactionRepository.sumAmountByUserAndTypeAndDateRange(user, "income",  from, to));
        BigDecimal totalExpense = nvl(transactionRepository.sumAmountByUserAndTypeAndDateRange(user, "expense", from, to));
        if (totalIncome.compareTo(BigDecimal.ZERO) == 0 && totalExpense.compareTo(BigDecimal.ZERO) == 0) {
            throw new NotFoundException("Not enough transaction history to generate an income statement.");
        }

        List<Object[]> monthlyIncome   = transactionRepository.sumByMonth(user, "income",  from, to);
        List<Object[]> monthlyExpenses = transactionRepository.sumByMonth(user, "expense", from, to);

        Map<String, BigDecimal> incMap = toMonthMap(monthlyIncome);
        Map<String, BigDecimal> expMap = toMonthMap(monthlyExpenses);

        List<MonthlySummaryItem> monthlySummary = new ArrayList<>();
        BigDecimal sumInc = BigDecimal.ZERO, sumExp = BigDecimal.ZERO;
        int count = 0;

        LocalDate cursor = from.withDayOfMonth(1);
        while (!cursor.isAfter(to)) {
            String key = cursor.getYear() + "-" + cursor.getMonthValue();
            BigDecimal inc = incMap.getOrDefault(key, BigDecimal.ZERO);
            BigDecimal exp = expMap.getOrDefault(key, BigDecimal.ZERO);

            monthlySummary.add(new MonthlySummaryItem(
                cursor.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + cursor.getYear(),
                inc, exp, inc.subtract(exp), true
            ));

            sumInc = sumInc.add(inc);
            sumExp = sumExp.add(exp);
            count++;
            cursor = cursor.plusMonths(1);
        }

        int divisor = count == 0 ? 1 : count;
        BigDecimal avgIncome = sumInc.divide(BigDecimal.valueOf(divisor), 2, RoundingMode.HALF_UP);
        BigDecimal avgExp    = sumExp.divide(BigDecimal.valueOf(divisor), 2, RoundingMode.HALF_UP);

        List<TaxReturn> returns = taxReturnRepository.findAllByUserAndYearRange(user, from.getYear(), to.getYear());
        boolean allFiled = !returns.isEmpty() && returns.stream().allMatch(r -> TaxReturnStatus.SUBMITTED.equals(r.getStatus()));
        String score = returns.isEmpty() ? "No Data" : allFiled ? "Good" : "Needs Attention";

        IncomeStatementResponse response = new IncomeStatementResponse();
        response.setStatementId(UUID.randomUUID());
        response.setPeriodStart(from);
        response.setPeriodEnd(to);
        response.setMonthsCovered(months);
        response.setTaxpayer(new TaxpayerSummary(
            user.getFullName(), user.getTin(), user.getPhone(),
            user.getTaxpayerCategory() != null ? user.getTaxpayerCategory().name() : null
        ));
        response.setMonthlySummary(monthlySummary);
        response.setAverages(new Averages(avgIncome, avgExp, avgIncome.subtract(avgExp)));
        response.setTaxCompliance(new TaxCompliance(allFiled, false, score));
        response.setGeneratedAt(LocalDateTime.now());
        return response;
    }

    public ReportTaxHistoryResponse getTaxHistory(User user, Integer yearFrom, Integer yearTo) {
        int currentYear = LocalDate.now().getYear();
        int toYear   = yearTo   != null ? yearTo   : currentYear;
        int fromYear = yearFrom != null ? yearFrom : toYear - 4;

        List<TaxReturn> returns = taxReturnRepository.findAllByUserAndYearRange(user, fromYear, toYear);

        Map<Integer, List<TaxReturn>> byYear = returns.stream()
            .collect(Collectors.groupingBy(TaxReturn::getTaxYear));

        List<YearHistoryEntry> history = byYear.entrySet().stream()
            .sorted(Map.Entry.<Integer, List<TaxReturn>>comparingByKey().reversed())
            .map(entry -> {
                List<TaxTypeEntry> taxTypes = entry.getValue().stream().map(r -> {
                    TaxTypeEntry tt = new TaxTypeEntry();
                    tt.setTaxType(r.getTaxType());
                    tt.setReturnStatus(r.getStatus());
                    tt.setTaxLiability(r.getTaxLiability());
                    tt.setFiledOn(r.getSubmittedAt());
                    tt.setCompliant(TaxReturnStatus.SUBMITTED.equals(r.getStatus()));
                    return tt;
                }).toList();

                boolean overallCompliant = entry.getValue().stream()
                    .allMatch(r -> TaxReturnStatus.SUBMITTED.equals(r.getStatus()));

                return new YearHistoryEntry(entry.getKey(), taxTypes, overallCompliant);
            }).toList();

        return new ReportTaxHistoryResponse(history);
    }


    private LocalDate[] resolveDateRange(String period, LocalDate dateFrom, LocalDate dateTo) {
        if (dateFrom != null && dateTo != null) {
            return new LocalDate[]{dateFrom, dateTo};
        }
        LocalDate today = LocalDate.now();
        return switch (period == null ? "month" : period) {
            case "week"    -> new LocalDate[]{today.minusDays(6), today};
            case "quarter" -> {
                int qStart = ((today.getMonthValue() - 1) / 3) * 3 + 1;
                yield new LocalDate[]{LocalDate.of(today.getYear(), qStart, 1), today};
            }
            case "year"    -> new LocalDate[]{LocalDate.of(today.getYear(), 1, 1), today};
            default        -> new LocalDate[]{today.withDayOfMonth(1), today};
        };
    }

    private List<CategoryTotal> categoryList(List<Object[]> rows) {
        return rows.stream().map(row -> new CategoryTotal(
            (String) row[0],
            row[1] == null ? BigDecimal.ZERO : (BigDecimal) row[1],
            ((Number) row[2]).longValue()
        )).toList();
    }

    private Map<String, BigDecimal> toMonthMap(List<Object[]> rows) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (Object[] row : rows) {
            int year  = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            BigDecimal sum = row[2] == null ? BigDecimal.ZERO : (BigDecimal) row[2];
            map.put(year + "-" + month, sum);
        }
        return map;
    }

    private BigDecimal nvl(BigDecimal val) {
        return val == null ? BigDecimal.ZERO : val;
    }
}
