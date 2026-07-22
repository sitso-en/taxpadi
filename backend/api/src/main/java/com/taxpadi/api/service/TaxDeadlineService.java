package com.taxpadi.api.service;

import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.deadline.CompleteDeadlineResponse;
import com.taxpadi.api.dto.deadline.DeadlineListResponse;
import com.taxpadi.api.dto.deadline.TaxDeadlineDto;
import com.taxpadi.api.dto.deadline.UpcomingDeadlinesResponse;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.model.PayeRecord;
import com.taxpadi.api.model.TaxDeadline;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.UserTaxProfile;
import com.taxpadi.api.repository.PayeRecordRepository;
import com.taxpadi.api.repository.TaxDeadlineRepository;
import com.taxpadi.api.repository.TaxReturnRepository;
import com.taxpadi.api.repository.TransactionRepository;
import com.taxpadi.api.repository.UserTaxProfileRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaxDeadlineService {

    private final TaxDeadlineRepository repo;
    private final UserTaxProfileRepository profileRepo;
    private final TransactionRepository txRepo;
    private final PayeRecordRepository payeRepo;
    private final TaxReturnRepository returnRepo;

    public TaxDeadlineService(TaxDeadlineRepository repo, UserTaxProfileRepository profileRepo,
                               TransactionRepository txRepo, PayeRecordRepository payeRepo,
                               TaxReturnRepository returnRepo) {
        this.repo = repo;
        this.profileRepo = profileRepo;
        this.txRepo = txRepo;
        this.payeRepo = payeRepo;
        this.returnRepo = returnRepo;
    }

    public DeadlineListResponse getAll(User user, int page, int limit) {
        List<TaxDeadlineDto> all = buildAllDeadlines(user);
        int total = all.size();
        int from = (page - 1) * limit;
        int to = Math.min(from + limit, total);
        List<TaxDeadlineDto> paged = from >= total ? List.of() : all.subList(from, to);
        int totalPages = total == 0 ? 1 : (int) Math.ceil((double) total / limit);
        return new DeadlineListResponse(paged, new PaginationInfo(total, page, limit, totalPages));
    }

    public UpcomingDeadlinesResponse getUpcoming(User user, int days) {
        if (days < 1 || days > 365) {
            throw new BadRequestException("Days parameter must be between 1 and 365.");
        }
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(days);
        List<TaxDeadlineDto> dtos = buildAllDeadlines(user).stream()
                .filter(d -> !d.getDeadlineDate().isBefore(today) && !d.getDeadlineDate().isAfter(cutoff))
                .map(this::withUrgency)
                .collect(Collectors.toList());
        return new UpcomingDeadlinesResponse(dtos);
    }

    @Transactional
    public CompleteDeadlineResponse complete(User user, String taxType,
                                              LocalDate periodStart, LocalDate periodEnd) {
        TaxDeadline d = repo.findFirstByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
                user, taxType, periodStart, periodEnd)
                .orElseGet(() -> newDeadlineEntity(user, taxType, periodStart, periodEnd));

        if (d.isCompleted()) {
            throw new BadRequestException("This deadline is already marked as complete.");
        }

        d.setCompleted(true);
        d.setCompletedAt(LocalDateTime.now());
        repo.save(d);

        CompleteDeadlineResponse resp = new CompleteDeadlineResponse();
        resp.setDeadlineId(deterministicId(user.getUserId(), taxType, periodStart));
        resp.setTaxType(taxType);
        resp.setDescription(d.getDescription());
        resp.setDeadlineDate(d.getDueDate());
        resp.setCompleted(true);
        resp.setCompletedAt(d.getCompletedAt());
        return resp;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private List<TaxDeadlineDto> buildAllDeadlines(User user) {
        UserTaxProfile profile = profileRepo.findByUser(user).orElse(null);
        boolean vatOk  = profile != null && Boolean.TRUE.equals(profile.getVatRegistered());
        boolean payeOk = profile != null && Boolean.TRUE.equals(profile.getPayeRegistered());

        List<Integer> years = new ArrayList<>(txRepo.findDistinctYearsByUser(user));
        if (years.isEmpty() && payeOk) {
            years.add(LocalDate.now().getYear());
        }

        List<TaxDeadlineDto> result = new ArrayList<>();

        for (int year : years) {
            LocalDate yearStart = LocalDate.of(year, 1, 1);
            LocalDate yearEnd   = LocalDate.of(year, 12, 31);

            List<Object[]> incomeByMonth = txRepo.sumByMonth(user, "income", yearStart, yearEnd);

            // Income tax — one per year if any income exists
            if (!incomeByMonth.isEmpty()) {
                result.add(buildDto(user, "income_tax",
                        "Annual Income Tax Filing " + year,
                        "File your annual income tax return with GRA for the " + year + " tax year.",
                        LocalDate.of(year + 1, 4, 30), yearStart, yearEnd));
            }

            // VAT — per month that had income (GRA requires monthly VAT returns)
            if (vatOk) {
                Set<Integer> incomeMonths = incomeByMonth.stream()
                        .map(row -> ((Number) row[1]).intValue())
                        .collect(Collectors.toSet());
                for (int m = 1; m <= 12; m++) {
                    if (!incomeMonths.contains(m)) continue;
                    LocalDate mStart = LocalDate.of(year, m, 1);
                    LocalDate mEnd   = mStart.withDayOfMonth(mStart.lengthOfMonth());
                    LocalDate due    = mEnd.plusMonths(1).withDayOfMonth(
                            mEnd.plusMonths(1).lengthOfMonth());
                    String monthName = mStart.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
                    result.add(buildDto(user, "vat",
                            "VAT Filing — " + monthName + " " + year,
                            "Submit VAT return and payment for " + monthName + " " + year + " to GRA.",
                            due, mStart, mEnd));
                }
            }

            // PAYE — one per month with payroll records
            if (payeOk) {
                List<PayeRecord> records = payeRepo.findAllByUserAndYear(user, year);
                Set<Integer> months = records.stream()
                        .map(PayeRecord::getMonth)
                        .collect(Collectors.toSet());
                for (int m : months) {
                    LocalDate pStart = LocalDate.of(year, m, 1);
                    LocalDate pEnd   = pStart.withDayOfMonth(pStart.lengthOfMonth());
                    LocalDate due    = pEnd.plusMonths(1).withDayOfMonth(
                            pEnd.plusMonths(1).lengthOfMonth());
                    String monthName = pStart.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
                    result.add(buildDto(user, "paye",
                            "PAYE Remittance — " + monthName + " " + year,
                            "Remit PAYE deductions to GRA for employees for " + monthName + " " + year + ".",
                            due, pStart, pEnd));
                }
            }

            // Withholding — one per month with WHT transactions
            List<Object[]> whtMonths = txRepo.findDistinctWithholdingMonths(user, yearStart, yearEnd);
            for (Object[] row : whtMonths) {
                int m = ((Number) row[1]).intValue();
                LocalDate wStart = LocalDate.of(year, m, 1);
                LocalDate wEnd   = wStart.withDayOfMonth(wStart.lengthOfMonth());
                LocalDate due    = wEnd.plusMonths(1).withDayOfMonth(15);
                String monthName = wStart.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
                result.add(buildDto(user, "withholding",
                        "Withholding Tax — " + monthName + " " + year,
                        "Remit withholding tax deductions to GRA for " + monthName + " " + year + ".",
                        due, wStart, wEnd));
            }
        }

        result.sort(Comparator.comparing(TaxDeadlineDto::getDeadlineDate));
        return result;
    }

    private TaxDeadlineDto buildDto(User user, String taxType, String title, String description,
                                     LocalDate due, LocalDate periodStart, LocalDate periodEnd) {
        TaxDeadlineDto dto = new TaxDeadlineDto();
        dto.setDeadlineId(deterministicId(user.getUserId(), taxType, periodStart));
        dto.setTaxType(taxType);
        dto.setTitle(title);
        dto.setDescription(description);
        dto.setDeadlineDate(due);
        dto.setDaysUntilDue(ChronoUnit.DAYS.between(LocalDate.now(), due));
        dto.setCompleted(isCompleted(user, taxType, periodStart, periodEnd));
        dto.setPeriodStart(periodStart);
        dto.setPeriodEnd(periodEnd);
        return dto;
    }

    private TaxDeadlineDto withUrgency(TaxDeadlineDto dto) {
        long d = dto.getDaysUntilDue();
        if (d <= 7)       dto.setUrgency("critical");
        else if (d <= 30) dto.setUrgency("warning");
        else              dto.setUrgency("normal");
        return dto;
    }

    private boolean isCompleted(User user, String taxType, LocalDate periodStart, LocalDate periodEnd) {
        // 1. Tax return filed or approved
        Optional<com.taxpadi.api.model.TaxReturn> ret =
                returnRepo.findFirstByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
                        user, taxType, periodStart, periodEnd);
        if (ret.isPresent()) {
            String status = ret.get().getStatus();
            if ("SUBMITTED".equals(status) || "APPROVED".equals(status)) return true;
        }

        // 2. Manual override stored in tax_deadlines table
        Optional<TaxDeadline> manual = repo.findFirstByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
                user, taxType, periodStart, periodEnd);
        if (manual.isPresent() && manual.get().isCompleted()) return true;

        // 3. PAYE — all records for the month are remitted
        if ("paye".equals(taxType)) {
            List<PayeRecord> records = payeRepo.findAllByUserAndMonthAndYear(
                    user, periodStart.getMonthValue(), periodStart.getYear());
            if (!records.isEmpty() && records.stream().allMatch(r -> Boolean.TRUE.equals(r.getRemitted()))) {
                return true;
            }
        }

        // 4. Withholding — no unremitted transactions in the period
        if ("withholding".equals(taxType)) {
            var unremitted = txRepo.findWhtTransactions(
                    user, false, null, periodStart, periodEnd, PageRequest.of(0, 1));
            if (unremitted.isEmpty()) return true;
        }

        return false;
    }

    private UUID deterministicId(UUID userId, String taxType, LocalDate periodStart) {
        String key = userId + ":" + taxType + ":" + periodStart;
        return UUID.nameUUIDFromBytes(key.getBytes(StandardCharsets.UTF_8));
    }

    private TaxDeadline newDeadlineEntity(User user, String taxType,
                                           LocalDate periodStart, LocalDate periodEnd) {
        LocalDate due = computeDueDate(taxType, periodEnd);
        TaxDeadline d = new TaxDeadline();
        d.setUser(user);
        d.setTaxType(taxType);
        d.setTitle(buildTitle(taxType, periodStart));
        d.setDescription(buildDescription(taxType, periodStart, periodEnd));
        d.setDueDate(due);
        d.setPeriodStart(periodStart);
        d.setPeriodEnd(periodEnd);
        d.setFrequency(frequency(taxType));
        d.setStatus("PENDING");
        d.setApplicableTo("user");
        d.setActive(true);
        return d;
    }

    private LocalDate computeDueDate(String taxType, LocalDate periodEnd) {
        return switch (taxType) {
            case "income_tax" -> LocalDate.of(periodEnd.getYear() + 1, 4, 30);
            case "withholding" -> periodEnd.plusMonths(1).withDayOfMonth(15);
            default -> {
                LocalDate after = periodEnd.plusMonths(1);
                yield after.withDayOfMonth(after.lengthOfMonth());
            }
        };
    }

    private String buildTitle(String taxType, LocalDate periodStart) {
        int year = periodStart.getYear();
        String month = periodStart.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        return switch (taxType) {
            case "income_tax"  -> "Annual Income Tax Filing " + year;
            case "vat"         -> "VAT Filing — " + month + " " + year;
            case "paye"        -> "PAYE Remittance — " + month + " " + year;
            case "withholding" -> "Withholding Tax — " + month + " " + year;
            default            -> taxType + " — " + periodStart;
        };
    }

    private String buildDescription(String taxType, LocalDate periodStart, LocalDate periodEnd) {
        int year = periodStart.getYear();
        String month = periodStart.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        return switch (taxType) {
            case "income_tax"  -> "File your annual income tax return with GRA for the " + year + " tax year.";
            case "vat"         -> "Submit VAT return and payment for " + month + " " + year + " to GRA.";
            case "paye"        -> "Remit PAYE deductions to GRA for employees for " + month + " " + year + ".";
            case "withholding" -> "Remit withholding tax deductions to GRA for " + month + " " + year + ".";
            default            -> "File " + taxType + " for period " + periodStart + " to " + periodEnd + ".";
        };
    }

    private String frequency(String taxType) {
        return switch (taxType) {
            case "income_tax" -> "annual";
            case "vat"        -> "monthly";
            default           -> "monthly";
        };
    }
}
