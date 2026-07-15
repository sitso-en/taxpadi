package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
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

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.taxpadi.api.constant.TaxReturnStatus;
import com.taxpadi.api.dto.report.Averages;
import com.taxpadi.api.dto.report.CategoryTotal;
import com.taxpadi.api.dto.report.ExpenseBreakdown;
import com.taxpadi.api.dto.report.ExportResponse;
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
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.TaxCalculation;
import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.Transaction;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.TaxCalculationRepository;
import com.taxpadi.api.repository.TaxReturnRepository;
import com.taxpadi.api.repository.TransactionRepository;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final TaxCalculationRepository taxCalculationRepository;
    private final TaxReturnRepository taxReturnRepository;
    private final ExportJobProcessor exportJobProcessor;
    private final StringRedisTemplate redis;

    public ReportService(TransactionRepository transactionRepository,
                         TaxCalculationRepository taxCalculationRepository,
                         TaxReturnRepository taxReturnRepository,
                         ExportJobProcessor exportJobProcessor,
                         StringRedisTemplate redis) {
        this.transactionRepository = transactionRepository;
        this.taxCalculationRepository = taxCalculationRepository;
        this.taxReturnRepository = taxReturnRepository;
        this.exportJobProcessor = exportJobProcessor;
        this.redis = redis;
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
        UUID exportId = UUID.randomUUID();
        response.setExportId(exportId);
        response.setFormat(format);
        response.setPeriodStart(dateFrom);
        response.setPeriodEnd(dateTo);
        response.setRecordsIncluded(new RecordsIncluded(transactions.size(), taxReturns.size(), 0, 0));

        if ("json".equals(format)) {
            response.setStatus("done");
            response.setData(buildJsonMap(user, dateFrom, dateTo, transactions, taxReturns));
        } else {
            // PDF and Excel are offloaded to a background thread
            String jobKey = "export:" + exportId;
            redis.opsForValue().set(jobKey, "{\"status\":\"processing\"}", Duration.ofHours(1));
            exportJobProcessor.process(exportId.toString(), user, format, dateFrom, dateTo, transactions, taxReturns);
            response.setStatus("processing");
            response.setNote("Your export is being generated. Poll GET /api/v1/reports/export/status/" + exportId + " to check progress.");
        }
        return response;
    }

    public Map<String, String> getExportStatus(String jobId) {
        String raw = redis.opsForValue().get("export:" + jobId);
        if (raw == null) {
            throw new NotFoundException("Export job not found or has expired.");
        }
        // Parse the simple JSON manually to avoid adding a full Jackson dependency here
        Map<String, String> result = new LinkedHashMap<>();
        raw = raw.replaceAll("[{}\"]", "");
        for (String pair : raw.split(",")) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) result.put(kv[0].trim(), kv[1].trim());
        }
        return result;
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
