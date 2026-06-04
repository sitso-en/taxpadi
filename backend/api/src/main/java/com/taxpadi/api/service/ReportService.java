package com.taxpadi.api.service;

import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.TaxCalculation;
import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.TaxCalculationRepository;
import com.taxpadi.api.repository.TaxReturnRepository;
import com.taxpadi.api.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final TaxCalculationRepository taxCalculationRepository;
    private final TaxReturnRepository taxReturnRepository;

    public ReportService(TransactionRepository transactionRepository,
                         TaxCalculationRepository taxCalculationRepository,
                         TaxReturnRepository taxReturnRepository) {
        this.transactionRepository = transactionRepository;
        this.taxCalculationRepository = taxCalculationRepository;
        this.taxReturnRepository = taxReturnRepository;
    }


    public Map<String, Object> getSummary(User user, String period, LocalDate dateFrom, LocalDate dateTo) {
        LocalDate[] range = resolveDateRange(period, dateFrom, dateTo);
        LocalDate from = range[0];
        LocalDate to   = range[1];

        BigDecimal incomeTotal   = nvl(transactionRepository.sumAmountByUserAndTypeAndDateRange(user, "income",  from, to));
        BigDecimal expenseTotal  = nvl(transactionRepository.sumAmountByUserAndTypeAndDateRange(user, "expense", from, to));
        BigDecimal deductible    = nvl(transactionRepository.sumDeductibleExpensesByUserAndDateRange(user, from, to));
        BigDecimal netProfit     = incomeTotal.subtract(expenseTotal);

        List<Object[]> incomeRows  = transactionRepository.sumByCategoryAndType(user, "income",  from, to);
        List<Object[]> expenseRows = transactionRepository.sumByCategoryAndType(user, "expense", from, to);

        //income tax liability for the year that covers this period
        BigDecimal incomeTax = BigDecimal.ZERO;
        LocalDate yearStart = LocalDate.of(from.getYear(), 1, 1);
        LocalDate yearEnd   = LocalDate.of(from.getYear(), 12, 31);
        Optional<TaxCalculation> calc = taxCalculationRepository
            .findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(user, "income_tax", yearStart, yearEnd);
        if (calc.isPresent()) {
            incomeTax = nvl(calc.get().getTaxLiability());
        }

        Map<String, Object> income = new LinkedHashMap<>();
        income.put("total", incomeTotal);
        income.put("by_category", categoryList(incomeRows));

        Map<String, Object> expenses = new LinkedHashMap<>();
        expenses.put("total", expenseTotal);
        expenses.put("deductible_total", deductible);
        expenses.put("by_category", categoryList(expenseRows));

        Map<String, Object> taxLiability = new LinkedHashMap<>();
        taxLiability.put("income_tax", incomeTax);
        taxLiability.put("vat", BigDecimal.ZERO);
        taxLiability.put("total", incomeTax);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("period_start", from);
        result.put("period_end", to);
        result.put("income", income);
        result.put("expenses", expenses);
        result.put("net_profit", netProfit);
        result.put("tax_liability", taxLiability);
        return result;
    }


    public Map<String, Object> exportData(User user, String format, LocalDate dateFrom, LocalDate dateTo,
                                          boolean includeTransactions, boolean includeTaxReturns) {
        if (ChronoUnit.DAYS.between(dateFrom, dateTo) > 3 * 365L) {
            throw new BadRequestException("Export date range cannot exceed 3 years.");
        }
        if (!List.of("json", "pdf", "excel").contains(format)) {
            throw new BadRequestException("Format must be one of: json, pdf, excel.");
        }

        long txCount      = includeTransactions ? transactionRepository.countByUserAndDateRange(user, dateFrom, dateTo) : 0;
        long returnCount  = includeTaxReturns   ? taxReturnRepository.findAllByUserAndYearRange(user, dateFrom.getYear(), dateTo.getYear()).size() : 0;

        Map<String, Object> records = new LinkedHashMap<>();
        records.put("transactions",  includeTransactions ? txCount      : 0);
        records.put("tax_returns",   includeTaxReturns   ? returnCount  : 0);
        records.put("payments",      0); //payment endpointssssssssss
        records.put("certificates",  0); //i am  waiting for compliance certificate endpoints

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("export_id",     UUID.randomUUID());
        result.put("format",        format);
        result.put("period_start",  dateFrom);
        result.put("period_end",    dateTo);
        result.put("records_included", records);

        if ("json".equals(format)) {
            result.put("file_url",   null);
            result.put("expires_at", null);
        } else {
            result.put("file_url",   null);
            result.put("expires_at", null);
            result.put("note",       format.toUpperCase() + " export requires S3 configuration. Use format=json for immediate data.");
        }
        return result;
    }


    public Map<String, Object> getIncomeStatement(User user, int months) {
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

        List<Map<String, Object>> monthlySummary = new ArrayList<>();
        BigDecimal sumInc = BigDecimal.ZERO, sumExp = BigDecimal.ZERO;
        int count = 0;

        LocalDate cursor = from.withDayOfMonth(1);
        while (!cursor.isAfter(to)) {
            String key = cursor.getYear() + "-" + cursor.getMonthValue();
            BigDecimal inc = incMap.getOrDefault(key, BigDecimal.ZERO);
            BigDecimal exp = expMap.getOrDefault(key, BigDecimal.ZERO);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("month",          cursor.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + cursor.getYear());
            row.put("total_income",   inc);
            row.put("total_expenses", exp);
            row.put("net_profit",     inc.subtract(exp));
            row.put("tax_compliant",  true);
            monthlySummary.add(row);

            sumInc = sumInc.add(inc);
            sumExp = sumExp.add(exp);
            count++;
            cursor = cursor.plusMonths(1);
        }

        int divisor = count == 0 ? 1 : count;
        BigDecimal avgIncome  = sumInc.divide(BigDecimal.valueOf(divisor), 2, RoundingMode.HALF_UP);
        BigDecimal avgExp     = sumExp.divide(BigDecimal.valueOf(divisor), 2, RoundingMode.HALF_UP);
        BigDecimal avgProfit  = avgIncome.subtract(avgExp);

        List<TaxReturn> returns = taxReturnRepository.findAllByUserAndYearRange(user, from.getYear(), to.getYear());
        boolean allFiled = !returns.isEmpty() && returns.stream().allMatch(r -> "submitted".equals(r.getStatus()));
        String score = returns.isEmpty() ? "No Data" : allFiled ? "Good" : "Needs Attention";

        Map<String, Object> averages = new LinkedHashMap<>();
        averages.put("average_monthly_income",   avgIncome);
        averages.put("average_monthly_expenses", avgExp);
        averages.put("average_monthly_profit",   avgProfit);

        Map<String, Object> compliance = new LinkedHashMap<>();
        compliance.put("all_returns_filed",  allFiled);
        compliance.put("all_payments_made",  false);//waiting for payment endpoints
        compliance.put("compliance_score",   score);

        Map<String, Object> taxpayer = new LinkedHashMap<>();
        taxpayer.put("full_name",          user.getFullName());
        taxpayer.put("tin",                user.getTin());
        taxpayer.put("phone",              user.getPhone());
        taxpayer.put("taxpayer_category",  user.getTaxpayerCategory());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("statement_id",    UUID.randomUUID());
        result.put("period_start",    from);
        result.put("period_end",      to);
        result.put("months_covered",  months);
        result.put("taxpayer",        taxpayer);
        result.put("monthly_summary", monthlySummary);
        result.put("averages",        averages);
        result.put("tax_compliance",  compliance);
        result.put("pdf_url",         null); // requires S3
        result.put("generated_at",    java.time.LocalDateTime.now());
        return result;
    }


    public Map<String, Object> getTaxHistory(User user, Integer yearFrom, Integer yearTo) {
        int currentYear = LocalDate.now().getYear();
        int toYear   = yearTo   != null ? yearTo   : currentYear;
        int fromYear = yearFrom != null ? yearFrom : toYear - 4;

        List<TaxReturn> returns = taxReturnRepository.findAllByUserAndYearRange(user, fromYear, toYear);

        Map<Integer, List<TaxReturn>> byYear = returns.stream()
            .collect(Collectors.groupingBy(TaxReturn::getTaxYear));

        List<Map<String, Object>> history = byYear.entrySet().stream()
            .sorted(Map.Entry.<Integer, List<TaxReturn>>comparingByKey().reversed())
            .map(entry -> {
                int year = entry.getKey();
                List<TaxReturn> yearReturns = entry.getValue();

                List<Map<String, Object>> taxTypes = yearReturns.stream().map(r -> {
                    Map<String, Object> tt = new LinkedHashMap<>();
                    tt.put("tax_type",      r.getTaxType());
                    tt.put("return_status", r.getStatus());
                    tt.put("tax_liability", r.getTaxLiability());
                    tt.put("amount_paid",   null); //ia m waiting for the payment endpoints
                    tt.put("filed_on",      r.getSubmittedAt());
                    tt.put("paid_on",       null); //payment endpoints
                    tt.put("compliant",     "submitted".equals(r.getStatus()));
                    return tt;
                }).toList();

                boolean overallCompliant = yearReturns.stream().allMatch(r -> "submitted".equals(r.getStatus()));

                Map<String, Object> yearMap = new LinkedHashMap<>();
                yearMap.put("year",             year);
                yearMap.put("tax_types",         taxTypes);
                yearMap.put("overall_compliant", overallCompliant);
                return yearMap;
            }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("history", history);
        return result;
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

    private List<Map<String, Object>> categoryList(List<Object[]> rows) {
        return rows.stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("category", row[0]);
            item.put("total",    row[1]);
            item.put("count",    row[2]);
            return item;
        }).toList();
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
