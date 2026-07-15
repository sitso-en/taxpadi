package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.paye.AddEmployeeResponse;
import com.taxpadi.api.dto.paye.AnnualReturnResponse;
import com.taxpadi.api.dto.paye.AnnualTotals;
import com.taxpadi.api.dto.paye.CreateEmployeeRequest;
import com.taxpadi.api.dto.paye.DeactivateEmployeeRequest;
import com.taxpadi.api.dto.paye.DeactivateEmployeeResponse;
import com.taxpadi.api.dto.paye.EmployeeAnnualSummary;
import com.taxpadi.api.dto.paye.EmployeeDetailDto;
import com.taxpadi.api.dto.paye.EmployeeListResponse;
import com.taxpadi.api.dto.paye.EmployeeSummaryDto;
import com.taxpadi.api.dto.paye.GrandTotals;
import com.taxpadi.api.dto.paye.MonthlyBreakdownItem;
import com.taxpadi.api.dto.paye.MonthlySummaryResponse;
import com.taxpadi.api.dto.paye.PayeMonthlyTotals;
import com.taxpadi.api.dto.paye.PayeRecordDto;
import com.taxpadi.api.dto.paye.PayeRecordListResponse;
import com.taxpadi.api.dto.paye.PayeRemitResponse;
import com.taxpadi.api.dto.paye.PayeSummaryDto;
import com.taxpadi.api.dto.paye.RemitRequest;
import com.taxpadi.api.dto.paye.UpdateEmployeeRequest;
import com.taxpadi.api.dto.paye.UpdateEmployeeResponse;
import com.taxpadi.api.constant.SubscriptionStatus;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.ForbiddenException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.Employee;
import com.taxpadi.api.model.PayeRecord;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.UserTaxProfile;
import com.taxpadi.api.repository.EmployeeRepository;
import com.taxpadi.api.repository.PayeRecordRepository;
import com.taxpadi.api.repository.SubscriptionRepository;
import com.taxpadi.api.repository.UserTaxProfileRepository;

@Service
public class PayeService {

    private final EmployeeRepository employeeRepository;
    private final PayeRecordRepository payeRecordRepository;
    private final GhanaTaxEngine taxEngine;
    private final SubscriptionRepository subscriptionRepository;
    private final UserTaxProfileRepository userTaxProfileRepository;

    public PayeService(EmployeeRepository employeeRepository,
                       PayeRecordRepository payeRecordRepository,
                       GhanaTaxEngine taxEngine,
                       SubscriptionRepository subscriptionRepository,
                       UserTaxProfileRepository userTaxProfileRepository) {
        this.employeeRepository = employeeRepository;
        this.payeRecordRepository = payeRecordRepository;
        this.taxEngine = taxEngine;
        this.subscriptionRepository = subscriptionRepository;
        this.userTaxProfileRepository = userTaxProfileRepository;
    }

    private void requirePaidSubscription(User user) {
        if (!subscriptionRepository.existsByUserAndStatus(user, SubscriptionStatus.ACTIVE)) {
            throw new ForbiddenException("PAYE management requires an active TaxPadi subscription.");
        }
    }


    public EmployeeListResponse getEmployees(User user, String status, int page, int limit) {
        requirePaidSubscription(user);
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);
        PageRequest pageable = PageRequest.of(safePage, safeLimit);

        Page<Employee> results = switch (status) {
            case "inactive" -> employeeRepository.findAllByUserAndIsActive(user, false, pageable);
            case "all"      -> employeeRepository.findAllByUser(user, pageable);
            default         -> employeeRepository.findAllByUserAndIsActive(user, true, pageable);
        };

        List<EmployeeSummaryDto> employees = results.getContent().stream()
            .map(e -> toSummary(e, computePaye(e)))
            .toList();

        PaginationInfo pagination = new PaginationInfo(
            results.getTotalElements(), page, safeLimit, results.getTotalPages()
        );
        return new EmployeeListResponse(employees, pagination);
    }

    @Transactional
    public AddEmployeeResponse addEmployee(User user, CreateEmployeeRequest request) {
        requirePaidSubscription(user);
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new BadRequestException("full_name is required.");
        }
        if (request.getGrossSalary() == null || request.getGrossSalary().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("gross_salary must be greater than 0.");
        }
        if (request.getStartDate() == null) {
            throw new BadRequestException("start_date is required.");
        }

        Employee emp = new Employee();
        emp.setUser(user);
        emp.setFullName(request.getFullName());
        emp.setPosition(request.getPosition());
        emp.setGrossSalary(request.getGrossSalary());
        emp.setTransportAllowance(orZero(request.getTransportAllowance()));
        emp.setHousingAllowance(orZero(request.getHousingAllowance()));
        emp.setOtherAllowances(orZero(request.getOtherAllowances()));
        emp.setSocialSecurityNo(request.getSocialSecurityNo());
        emp.setStartDate(request.getStartDate());
        employeeRepository.save(emp);

        // Toggle paye_registered on first active employee
        long activeCount = employeeRepository.countByUserAndIsActive(user, true);
        if (activeCount == 1) {
            userTaxProfileRepository.findByUser(user).ifPresent(profile -> {
                profile.setPayeRegistered(true);
                userTaxProfileRepository.save(profile);
            });
        }

        BigDecimal monthlyPaye = computePaye(emp);

        AddEmployeeResponse response = new AddEmployeeResponse();
        response.setEmployeeId(emp.getEmployeeId());
        response.setFullName(emp.getFullName());
        response.setGrossSalary(emp.getGrossSalary());
        response.setMonthlyPaye(monthlyPaye);
        response.setSsnitWarning(emp.getSocialSecurityNo() == null);
        response.setCreatedAt(emp.getCreatedAt());
        return response;
    }

    public EmployeeDetailDto getEmployee(User user, UUID employeeId) {
        requirePaidSubscription(user);
        Employee emp = employeeRepository.findByEmployeeIdAndUser(employeeId, user)
            .orElseThrow(() -> new NotFoundException("No employee found with this ID."));

        BigDecimal monthlyPaye = computePaye(emp);
        List<PayeRecord> records = payeRecordRepository.findAllByEmployee(emp);

        BigDecimal totalDeducted = sum(records, PayeRecord::getPayeDeducted);
        BigDecimal totalRemitted = records.stream()
            .filter(PayeRecord::getRemitted)
            .map(PayeRecord::getPayeDeducted)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal outstanding = totalDeducted.subtract(totalRemitted);

        EmployeeDetailDto.PayeSummary summary = new EmployeeDetailDto.PayeSummary(
            records.size(), totalDeducted, totalRemitted, outstanding
        );

        return new EmployeeDetailDto(
            emp.getEmployeeId(), emp.getFullName(), emp.getPosition(),
            emp.getGrossSalary(), emp.getTransportAllowance(),
            emp.getHousingAllowance(), emp.getOtherAllowances(),
            emp.getSocialSecurityNo(), emp.getStartDate(), emp.getEndDate(),
            emp.getIsActive(), monthlyPaye, summary,
            emp.getCreatedAt(), emp.getUpdatedAt()
        );
    }

    @Transactional
    public UpdateEmployeeResponse updateEmployee(User user, UUID employeeId, UpdateEmployeeRequest request) {
        requirePaidSubscription(user);
        Employee emp = employeeRepository.findByEmployeeIdAndUser(employeeId, user)
            .orElseThrow(() -> new NotFoundException("No employee found with this ID."));

        boolean recalculated = false;

        if (request.getFullName() != null) emp.setFullName(request.getFullName());
        if (request.getPosition() != null) emp.setPosition(request.getPosition());
        if (request.getSocialSecurityNo() != null) emp.setSocialSecurityNo(request.getSocialSecurityNo());

        if (request.getGrossSalary() != null || request.getTransportAllowance() != null
                || request.getHousingAllowance() != null || request.getOtherAllowances() != null) {
            if (request.getGrossSalary() != null) emp.setGrossSalary(request.getGrossSalary());
            if (request.getTransportAllowance() != null) emp.setTransportAllowance(request.getTransportAllowance());
            if (request.getHousingAllowance() != null) emp.setHousingAllowance(request.getHousingAllowance());
            if (request.getOtherAllowances() != null) emp.setOtherAllowances(request.getOtherAllowances());
            recalculated = true;
        }

        employeeRepository.save(emp);
        BigDecimal monthlyPaye = computePaye(emp);

        UpdateEmployeeResponse response = new UpdateEmployeeResponse();
        response.setEmployeeId(emp.getEmployeeId());
        response.setFullName(emp.getFullName());
        response.setGrossSalary(emp.getGrossSalary());
        response.setMonthlyPaye(monthlyPaye);
        response.setPayeRecalculated(recalculated);
        response.setUpdatedAt(emp.getUpdatedAt());
        return response;
    }

    @Transactional
    public DeactivateEmployeeResponse deactivateEmployee(User user, UUID employeeId, DeactivateEmployeeRequest request) {
        requirePaidSubscription(user);
        Employee emp = employeeRepository.findByEmployeeIdAndUser(employeeId, user)
            .orElseThrow(() -> new NotFoundException("No employee found with this ID."));

        if (!emp.getIsActive()) {
            throw new BadRequestException("This employee is already inactive.");
        }
        if (request.getEndDate() == null) {
            throw new BadRequestException("end_date is required.");
        }

        emp.setIsActive(false);
        emp.setEndDate(request.getEndDate());
        employeeRepository.save(emp);

        // Clear paye_registered when last active employee is deactivated
        long remaining = employeeRepository.countByUserAndIsActive(user, true);
        if (remaining == 0) {
            userTaxProfileRepository.findByUser(user).ifPresent(profile -> {
                profile.setPayeRegistered(false);
                userTaxProfileRepository.save(profile);
            });
        }

        DeactivateEmployeeResponse response = new DeactivateEmployeeResponse();
        response.setEmployeeId(emp.getEmployeeId());
        response.setFullName(emp.getFullName());
        response.setActive(false);
        response.setEndDate(emp.getEndDate());
        return response;
    }

    public PayeRecordListResponse getRecords(User user, Integer month, Integer year,
                                             UUID employeeId, Boolean remitted, int page, int limit) {
        requirePaidSubscription(user);
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);
        PageRequest pageable = PageRequest.of(safePage, safeLimit);

        Page<PayeRecord> results;
        if (month != null && year != null) {
            generateMonthlyRecords(user, month, year);
            results = payeRecordRepository.findAllByUserAndMonthAndYear(user, month, year, pageable);
        } else if (year != null) {
            results = payeRecordRepository.findAllByUserAndYear(user, year, pageable);
        } else if (employeeId != null) {
            Employee emp = employeeRepository.findByEmployeeIdAndUser(employeeId, user)
                .orElseThrow(() -> new NotFoundException("No employee found with this ID."));
            results = payeRecordRepository.findAllByUserAndEmployee(user, emp, pageable);
        } else if (remitted != null) {
            results = payeRecordRepository.findAllByUserAndRemitted(user, remitted, pageable);
        } else {
            results = payeRecordRepository.findAllByUser(user, pageable);
        }

        List<PayeRecordDto> records = results.getContent().stream().map(this::toRecordDto).toList();

        BigDecimal totalDeducted = sum(results.getContent(), PayeRecord::getPayeDeducted);
        BigDecimal totalRemitted2 = results.getContent().stream()
            .filter(PayeRecord::getRemitted).map(PayeRecord::getPayeDeducted)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        PayeSummaryDto summary = new PayeSummaryDto(
            totalDeducted, totalRemitted2, totalDeducted.subtract(totalRemitted2)
        );
        PaginationInfo pagination = new PaginationInfo(
            results.getTotalElements(), page, safeLimit, results.getTotalPages()
        );
        return new PayeRecordListResponse(records, summary, pagination);
    }

    public MonthlySummaryResponse getMonthlySummary(User user, int month, int year) {
        requirePaidSubscription(user);
        if (month < 1 || month > 12) throw new BadRequestException("Month must be between 1 and 12.");

        generateMonthlyRecords(user, month, year);

        List<PayeRecord> records = payeRecordRepository.findAllByUserAndMonthAndYear(user, month, year);
        if (records.isEmpty()) throw new NotFoundException("No active employees found. Add employees before viewing PAYE records.");

        LocalDate dueDate = LocalDate.of(year, month, 1).plusMonths(1).withDayOfMonth(15);
        long daysUntilDue = LocalDate.now().until(dueDate).getDays();

        List<PayeRecordDto> employeeDtos = records.stream().map(this::toRecordDto).toList();

        BigDecimal totalGross = sum(records, PayeRecord::getGrossSalary);
        BigDecimal totalTaxable = sum(records, PayeRecord::getTaxableSalary);
        BigDecimal totalDeducted = sum(records, PayeRecord::getPayeDeducted);
        BigDecimal totalRemitted = records.stream().filter(PayeRecord::getRemitted)
            .map(PayeRecord::getPayeDeducted).reduce(BigDecimal.ZERO, BigDecimal::add);

        PayeMonthlyTotals totals = new PayeMonthlyTotals(
            totalGross, totalTaxable, totalDeducted, totalRemitted, totalDeducted.subtract(totalRemitted)
        );

        MonthlySummaryResponse response = new MonthlySummaryResponse();
        response.setMonth(month);
        response.setYear(year);
        response.setRemittanceDueDate(dueDate);
        response.setDaysUntilDue(daysUntilDue);
        response.setEmployees(employeeDtos);
        response.setTotals(totals);
        return response;
    }

    @Transactional
    public PayeRemitResponse remit(User user, UUID payeId, RemitRequest request) {
        requirePaidSubscription(user);
        PayeRecord record = payeRecordRepository.findByPayeIdAndUser(payeId, user)
            .orElseThrow(() -> new NotFoundException("No PAYE record found with this ID."));

        if (record.getRemitted()) {
            throw new BadRequestException("This PAYE record has already been marked as remitted.");
        }

        record.setRemitted(true);
        record.setRemittedAt(request.getRemittedAt() != null ? request.getRemittedAt() : LocalDateTime.now());
        payeRecordRepository.save(record);

        PayeRemitResponse response = new PayeRemitResponse();
        response.setPayeId(record.getPayeId());
        response.setEmployeeName(record.getEmployee().getFullName());
        response.setMonth(record.getMonth());
        response.setYear(record.getYear());
        response.setPayeDeducted(record.getPayeDeducted());
        response.setRemitted(true);
        response.setRemittedAt(record.getRemittedAt());
        return response;
    }

    public AnnualReturnResponse getAnnualReturn(User user, int year) {
        requirePaidSubscription(user);
        List<PayeRecord> allRecords = payeRecordRepository.findAllByUserAndYear(user, year);
        if (allRecords.isEmpty()) throw new NotFoundException("No PAYE records found for this year.");

        LocalDate deadline = LocalDate.of(year + 1, 4, 30);
        long daysUntilDeadline = LocalDate.now().until(deadline).getDays();

        Map<UUID, List<PayeRecord>> byEmployee = new LinkedHashMap<>();
        for (PayeRecord r : allRecords) {
            byEmployee.computeIfAbsent(r.getEmployee().getEmployeeId(), k -> new ArrayList<>()).add(r);
        }

        List<EmployeeAnnualSummary> employeeSummaries = byEmployee.values().stream().map(records -> {
            Employee emp = records.get(0).getEmployee();
            List<MonthlyBreakdownItem> monthlyBreakdown = records.stream().map(r -> new MonthlyBreakdownItem(
                r.getMonth(), r.getGrossSalary(), r.getTaxableSalary(), r.getPayeDeducted(), r.getRemitted()
            )).toList();

            BigDecimal totalGross = sum(records, PayeRecord::getGrossSalary);
            BigDecimal totalTaxable = sum(records, PayeRecord::getTaxableSalary);
            BigDecimal totalDeducted = sum(records, PayeRecord::getPayeDeducted);
            BigDecimal totalRemitted = records.stream().filter(PayeRecord::getRemitted)
                .map(PayeRecord::getPayeDeducted).reduce(BigDecimal.ZERO, BigDecimal::add);

            EmployeeAnnualSummary summary = new EmployeeAnnualSummary();
            summary.setEmployeeId(emp.getEmployeeId());
            summary.setFullName(emp.getFullName());
            summary.setSocialSecurityNo(emp.getSocialSecurityNo());
            summary.setMonthlyBreakdown(monthlyBreakdown);
            summary.setAnnualTotals(new AnnualTotals(
                totalGross, totalTaxable, totalDeducted, totalRemitted, totalDeducted.subtract(totalRemitted)
            ));
            return summary;
        }).toList();

        BigDecimal grandTotalDeducted = sum(allRecords, PayeRecord::getPayeDeducted);
        BigDecimal grandTotalRemitted = allRecords.stream().filter(PayeRecord::getRemitted)
            .map(PayeRecord::getPayeDeducted).reduce(BigDecimal.ZERO, BigDecimal::add);

        GrandTotals grandTotals = new GrandTotals(
            byEmployee.size(),
            sum(allRecords, PayeRecord::getGrossSalary),
            grandTotalDeducted,
            grandTotalRemitted,
            grandTotalDeducted.subtract(grandTotalRemitted)
        );

        AnnualReturnResponse response = new AnnualReturnResponse();
        response.setYear(year);
        response.setSubmissionDeadline(deadline);
        response.setDaysUntilDeadline(daysUntilDeadline);
        response.setEmployees(employeeSummaries);
        response.setGrandTotals(grandTotals);
        response.setReadyForSubmission(grandTotalDeducted.compareTo(grandTotalRemitted) == 0);
        return response;
    }


    @Transactional
    public void generateMonthlyRecords(User user, int month, int year) {
        List<Employee> activeEmployees = employeeRepository.findAllByUserAndIsActive(user, true);
        java.util.Set<UUID> existingIds = payeRecordRepository.findEmployeeIdsWithRecords(user, month, year);

        List<PayeRecord> newRecords = new ArrayList<>();
        for (Employee emp : activeEmployees) {
            if (existingIds.contains(emp.getEmployeeId())) continue;
            BigDecimal taxableSalary = computeTaxableSalary(emp);
            BigDecimal payeDeducted = taxEngine.calculatePaye(taxableSalary);

            PayeRecord record = new PayeRecord();
            record.setUser(user);
            record.setEmployee(emp);
            record.setMonth(month);
            record.setYear(year);
            record.setGrossSalary(emp.getGrossSalary());
            record.setTaxableSalary(taxableSalary);
            record.setPayeDeducted(payeDeducted);
            record.setRemitted(false);
            newRecords.add(record);
        }
        if (!newRecords.isEmpty()) {
            payeRecordRepository.saveAll(newRecords);
        }
    }


    private BigDecimal computeTaxableSalary(Employee emp) {
        BigDecimal transportExempt = emp.getTransportAllowance().min(new BigDecimal("600"));
        return emp.getGrossSalary()
            .add(emp.getTransportAllowance())
            .add(emp.getHousingAllowance())
            .add(emp.getOtherAllowances())
            .subtract(transportExempt)
            .max(BigDecimal.ZERO);
    }

    private BigDecimal computePaye(Employee emp) {
        return taxEngine.calculatePaye(computeTaxableSalary(emp));
    }

    private BigDecimal orZero(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }

    private BigDecimal sum(List<PayeRecord> records, java.util.function.Function<PayeRecord, BigDecimal> fn) {
        return records.stream().map(fn).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private EmployeeSummaryDto toSummary(Employee e, BigDecimal monthlyPaye) {
        return new EmployeeSummaryDto(
            e.getEmployeeId(), e.getFullName(), e.getPosition(),
            e.getGrossSalary(), e.getTransportAllowance(),
            e.getHousingAllowance(), e.getOtherAllowances(),
            e.getSocialSecurityNo(), e.getStartDate(),
            e.getIsActive(), monthlyPaye, e.getCreatedAt()
        );
    }

    private PayeRecordDto toRecordDto(PayeRecord r) {
        return new PayeRecordDto(
            r.getPayeId(), r.getEmployee().getEmployeeId(), r.getEmployee().getFullName(),
            r.getMonth(), r.getYear(), r.getGrossSalary(), r.getTaxableSalary(),
            r.getPayeDeducted(), r.getRemitted(), r.getRemittedAt()
        );
    }
}
