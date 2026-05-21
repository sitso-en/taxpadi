package com.taxpadi.api.service;

import java.math.BigDecimal;
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

import com.taxpadi.api.dto.paye.CreateEmployeeRequest;
import com.taxpadi.api.dto.paye.DeactivateEmployeeRequest;
import com.taxpadi.api.dto.paye.EmployeeDetailDto;
import com.taxpadi.api.dto.paye.EmployeeSummaryDto;
import com.taxpadi.api.dto.paye.PayeRecordDto;
import com.taxpadi.api.dto.paye.RemitRequest;
import com.taxpadi.api.dto.paye.UpdateEmployeeRequest;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.Employee;
import com.taxpadi.api.model.PayeRecord;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.EmployeeRepository;
import com.taxpadi.api.repository.PayeRecordRepository;

@Service
public class PayeService {

    private final EmployeeRepository employeeRepository;
    private final PayeRecordRepository payeRecordRepository;
    private final GhanaTaxEngine taxEngine;

    public PayeService(EmployeeRepository employeeRepository,
                       PayeRecordRepository payeRecordRepository,
                       GhanaTaxEngine taxEngine) {
        this.employeeRepository = employeeRepository;
        this.payeRecordRepository = payeRecordRepository;
        this.taxEngine = taxEngine;
    }

    // ── Employees ────────────────────────────────────────────────────────────

    public Map<String, Object> getEmployees(User user, String status, int page, int limit) {
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

        return Map.of(
            "employees", employees,
            "pagination", Map.of(
                "total", results.getTotalElements(),
                "page", page,
                "limit", safeLimit,
                "total_pages", results.getTotalPages()
            )
        );
    }

    @Transactional
    public Map<String, Object> addEmployee(User user, CreateEmployeeRequest request) {
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

        BigDecimal monthlyPaye = computePaye(emp);
        boolean ssnitWarning = emp.getSocialSecurityNo() == null;

        return Map.of(
            "employee_id", emp.getEmployeeId(),
            "full_name", emp.getFullName(),
            "gross_salary", emp.getGrossSalary(),
            "monthly_paye", monthlyPaye,
            "ssnit_warning", ssnitWarning,
            "created_at", emp.getCreatedAt()
        );
    }

    public EmployeeDetailDto getEmployee(User user, UUID employeeId) {
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
    public Map<String, Object> updateEmployee(User user, UUID employeeId, UpdateEmployeeRequest request) {
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

        return Map.of(
            "employee_id", emp.getEmployeeId(),
            "full_name", emp.getFullName(),
            "gross_salary", emp.getGrossSalary(),
            "monthly_paye", monthlyPaye,
            "paye_recalculated", recalculated,
            "updated_at", emp.getUpdatedAt()
        );
    }

    @Transactional
    public Map<String, Object> deactivateEmployee(User user, UUID employeeId, DeactivateEmployeeRequest request) {
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

        return Map.of(
            "employee_id", emp.getEmployeeId(),
            "full_name", emp.getFullName(),
            "is_active", false,
            "end_date", emp.getEndDate()
        );
    }


    public Map<String, Object> getRecords(User user, Integer month, Integer year,
                                          UUID employeeId, Boolean remitted, int page, int limit) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);
        PageRequest pageable = PageRequest.of(safePage, safeLimit);

        Page<PayeRecord> results;
        if (month != null && year != null) {
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
        BigDecimal totalRemitted = results.getContent().stream()
            .filter(PayeRecord::getRemitted).map(PayeRecord::getPayeDeducted)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
            "records", records,
            "summary", Map.of(
                "total_paye_deducted", totalDeducted,
                "total_remitted", totalRemitted,
                "total_outstanding", totalDeducted.subtract(totalRemitted)
            ),
            "pagination", Map.of(
                "total", results.getTotalElements(),
                "page", page,
                "limit", safeLimit,
                "total_pages", results.getTotalPages()
            )
        );
    }

    public Map<String, Object> getMonthlySummary(User user, int month, int year) {
        if (month < 1 || month > 12) throw new BadRequestException("Month must be between 1 and 12.");

        List<PayeRecord> records = payeRecordRepository.findAllByUserAndMonthAndYear(user, month, year);
        if (records.isEmpty()) throw new NotFoundException("No PAYE records found for this month and year.");

        LocalDate dueDate = LocalDate.of(year, month, 1).plusMonths(1).withDayOfMonth(15);
        long daysUntilDue = LocalDate.now().until(dueDate).getDays();

        List<PayeRecordDto> employeeDtos = records.stream().map(this::toRecordDto).toList();

        BigDecimal totalGross = sum(records, PayeRecord::getGrossSalary);
        BigDecimal totalTaxable = sum(records, PayeRecord::getTaxableSalary);
        BigDecimal totalDeducted = sum(records, PayeRecord::getPayeDeducted);
        BigDecimal totalRemitted = records.stream().filter(PayeRecord::getRemitted)
            .map(PayeRecord::getPayeDeducted).reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
            "month", month,
            "year", year,
            "remittance_due_date", dueDate,
            "days_until_due", daysUntilDue,
            "employees", employeeDtos,
            "totals", Map.of(
                "total_gross_salary", totalGross,
                "total_taxable_salary", totalTaxable,
                "total_paye_deducted", totalDeducted,
                "total_remitted", totalRemitted,
                "total_outstanding", totalDeducted.subtract(totalRemitted)
            )
        );
    }

    @Transactional
    public Map<String, Object> remit(User user, UUID payeId, RemitRequest request) {
        PayeRecord record = payeRecordRepository.findByPayeIdAndUser(payeId, user)
            .orElseThrow(() -> new NotFoundException("No PAYE record found with this ID."));

        if (record.getRemitted()) {
            throw new BadRequestException("This PAYE record has already been marked as remitted.");
        }

        record.setRemitted(true);
        record.setRemittedAt(request.getRemittedAt() != null ? request.getRemittedAt() : LocalDateTime.now());
        payeRecordRepository.save(record);

        return Map.of(
            "paye_id", record.getPayeId(),
            "employee_name", record.getEmployee().getFullName(),
            "month", record.getMonth(),
            "year", record.getYear(),
            "paye_deducted", record.getPayeDeducted(),
            "remitted", true,
            "remitted_at", record.getRemittedAt()
        );
    }

    public Map<String, Object> getAnnualReturn(User user, int year) {
        List<PayeRecord> allRecords = payeRecordRepository.findAllByUserAndYear(user, year);
        if (allRecords.isEmpty()) throw new NotFoundException("No PAYE records found for this year.");

        LocalDate deadline = LocalDate.of(year + 1, 4, 30);
        long daysUntilDeadline = LocalDate.now().until(deadline).getDays();

        // Group by employee
        Map<UUID, List<PayeRecord>> byEmployee = new LinkedHashMap<>();
        for (PayeRecord r : allRecords) {
            byEmployee.computeIfAbsent(r.getEmployee().getEmployeeId(), k -> new java.util.ArrayList<>()).add(r);
        }

        List<Map<String, Object>> employeeSummaries = byEmployee.values().stream().map(records -> {
            Employee emp = records.get(0).getEmployee();
            List<Map<String, Object>> monthlyBreakdown = records.stream().map(r -> Map.<String, Object>of(
                "month", r.getMonth(),
                "gross_salary", r.getGrossSalary(),
                "taxable_salary", r.getTaxableSalary(),
                "paye_deducted", r.getPayeDeducted(),
                "remitted", r.getRemitted()
            )).toList();

            BigDecimal totalGross = sum(records, PayeRecord::getGrossSalary);
            BigDecimal totalTaxable = sum(records, PayeRecord::getTaxableSalary);
            BigDecimal totalDeducted = sum(records, PayeRecord::getPayeDeducted);
            BigDecimal totalRemitted = records.stream().filter(PayeRecord::getRemitted)
                .map(PayeRecord::getPayeDeducted).reduce(BigDecimal.ZERO, BigDecimal::add);

            return Map.<String, Object>of(
                "employee_id", emp.getEmployeeId(),
                "full_name", emp.getFullName(),
                "social_security_no", emp.getSocialSecurityNo() != null ? emp.getSocialSecurityNo() : "",
                "monthly_breakdown", monthlyBreakdown,
                "annual_totals", Map.of(
                    "total_gross_salary", totalGross,
                    "total_taxable_salary", totalTaxable,
                    "total_paye_deducted", totalDeducted,
                    "total_remitted", totalRemitted,
                    "outstanding", totalDeducted.subtract(totalRemitted)
                )
            );
        }).toList();

        BigDecimal grandTotalDeducted = sum(allRecords, PayeRecord::getPayeDeducted);
        BigDecimal grandTotalRemitted = allRecords.stream().filter(PayeRecord::getRemitted)
            .map(PayeRecord::getPayeDeducted).reduce(BigDecimal.ZERO, BigDecimal::add);
        boolean readyForSubmission = grandTotalDeducted.compareTo(grandTotalRemitted) == 0;

        return Map.of(
            "year", year,
            "submission_deadline", deadline,
            "days_until_deadline", daysUntilDeadline,
            "employees", employeeSummaries,
            "grand_totals", Map.of(
                "total_employees", byEmployee.size(),
                "total_gross_salary", sum(allRecords, PayeRecord::getGrossSalary),
                "total_paye_deducted", grandTotalDeducted,
                "total_remitted", grandTotalRemitted,
                "outstanding", grandTotalDeducted.subtract(grandTotalRemitted)
            ),
            "ready_for_submission", readyForSubmission
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Taxable salary = gross - transport allowance (exempt up to GHS 600/month per GRA).
     * Housing allowance is partially exempt — simplified here as fully taxable since
     * the exact exempt portion requires employment contract details.
     */
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
