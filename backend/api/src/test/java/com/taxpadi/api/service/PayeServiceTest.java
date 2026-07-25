package com.taxpadi.api.service;

import com.taxpadi.api.dto.paye.CreateEmployeeRequest;
import com.taxpadi.api.dto.paye.DeactivateEmployeeRequest;
import com.taxpadi.api.model.Employee;
import com.taxpadi.api.model.PayeRecord;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.UserTaxProfile;
import com.taxpadi.api.repository.EmployeeRepository;
import com.taxpadi.api.repository.PayeRecordRepository;
import com.taxpadi.api.repository.SubscriptionRepository;
import com.taxpadi.api.repository.UserTaxProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Verifies the PAYE base construction and the paye_registered profile toggle.
 *
 * Key conformance point: taxable salary = gross + allowances - 5.5% SSNIT, with
 * transport allowance fully taxable (the old GHS 600 transport exemption is gone).
 */
@ExtendWith(MockitoExtension.class)
class PayeServiceTest {

    @Mock private EmployeeRepository employeeRepository;
    @Mock private PayeRecordRepository payeRecordRepository;
    @Mock private SubscriptionRepository subscriptionRepository;
    @Mock private UserTaxProfileRepository userTaxProfileRepository;

    private final GhanaTaxEngine taxEngine = new GhanaTaxEngine();
    private PayeService service;

    @BeforeEach
    void setUp() {
        service = new PayeService(employeeRepository, payeRecordRepository, taxEngine,
                subscriptionRepository, userTaxProfileRepository);
    }

    // ── PAYE base: SSNIT deducted, transport fully taxed ──

    @Test
    void generateMonthlyRecords_deductsSsnitAndTaxesTransportInFull() {
        User user = new User();
        Employee emp = employee(new BigDecimal("2000"), new BigDecimal("600"));

        when(employeeRepository.findAllByUserAndIsActive(user, true)).thenReturn(List.of(emp));
        when(payeRecordRepository.findEmployeeIdsWithRecords(user, 3, 2026)).thenReturn(Set.of());

        service.generateMonthlyRecords(user, 3, 2026);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<PayeRecord>> captor = ArgumentCaptor.forClass(List.class);
        verify(payeRecordRepository).saveAll(captor.capture());
        PayeRecord record = captor.getValue().get(0);

        // taxable = 2000 + 600 - (2000 * 5.5%) = 2490  (transport NOT exempt)
        assertThat(record.getTaxableSalary()).isEqualByComparingTo("2490.00");
        assertThat(record.getGrossSalary()).isEqualByComparingTo("2000.00");
        // PAYE on 2490: 0 + 110@5% + 130@10% + 1760@17.5% = 5.5 + 13 + 308 = 326.50
        assertThat(record.getPayeDeducted()).isEqualByComparingTo("326.50");
    }

    // ── Idempotency: employees that already have a record are skipped ──

    @Test
    void generateMonthlyRecords_skipsEmployeesWithExistingRecord() {
        User user = new User();
        Employee emp = employee(new BigDecimal("2000"), new BigDecimal("600"));

        when(employeeRepository.findAllByUserAndIsActive(user, true)).thenReturn(List.of(emp));
        when(payeRecordRepository.findEmployeeIdsWithRecords(user, 3, 2026))
            .thenReturn(Set.of(emp.getEmployeeId()));

        service.generateMonthlyRecords(user, 3, 2026);

        verify(payeRecordRepository, never()).saveAll(any());
    }

    // ── paye_registered toggles on first hire and last departure ──

    @Test
    void addEmployee_firstActiveEmployee_setsPayeRegistered() {
        User user = new User();
        UserTaxProfile profile = new UserTaxProfile();
        profile.setPayeRegistered(false);

        when(subscriptionRepository.existsByUserAndStatus(any(), eq("active"))).thenReturn(true);
        when(employeeRepository.countByUserAndIsActive(user, true)).thenReturn(1L);
        when(userTaxProfileRepository.findByUser(user)).thenReturn(Optional.of(profile));

        CreateEmployeeRequest request = new CreateEmployeeRequest();
        request.setFullName("Ama Mensah");
        request.setGrossSalary(new BigDecimal("2000"));
        request.setStartDate(LocalDate.of(2026, 1, 1));

        service.addEmployee(user, request);

        assertThat(profile.getPayeRegistered()).isTrue();
        verify(userTaxProfileRepository).save(profile);
    }

    @Test
    void deactivateEmployee_lastActiveEmployee_clearsPayeRegistered() {
        User user = new User();
        Employee emp = employee(new BigDecimal("2000"), new BigDecimal("600"));
        UserTaxProfile profile = new UserTaxProfile();
        profile.setPayeRegistered(true);

        when(subscriptionRepository.existsByUserAndStatus(any(), eq("active"))).thenReturn(true);
        when(employeeRepository.findByEmployeeIdAndUser(emp.getEmployeeId(), user))
            .thenReturn(Optional.of(emp));
        when(employeeRepository.countByUserAndIsActive(user, true)).thenReturn(0L);
        when(userTaxProfileRepository.findByUser(user)).thenReturn(Optional.of(profile));

        DeactivateEmployeeRequest request = new DeactivateEmployeeRequest();
        request.setEndDate(LocalDate.of(2026, 6, 30));

        service.deactivateEmployee(user, emp.getEmployeeId(), request);

        assertThat(profile.getPayeRegistered()).isFalse();
        verify(userTaxProfileRepository).save(profile);
    }

    // ── helpers ──

    private Employee employee(BigDecimal gross, BigDecimal transport) {
        Employee emp = new Employee();
        emp.setGrossSalary(gross);
        emp.setTransportAllowance(transport);
        emp.setHousingAllowance(BigDecimal.ZERO);
        emp.setOtherAllowances(BigDecimal.ZERO);
        emp.setIsActive(true);
        setId(emp, UUID.randomUUID());
        return emp;
    }

    private void setId(Employee emp, UUID id) {
        try {
            Field f = Employee.class.getDeclaredField("employeeId");
            f.setAccessible(true);
            f.set(emp, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }
}
