package com.taxpadi.api.service;

import com.taxpadi.api.constant.VatReturnStatus;
import com.taxpadi.api.dto.vat.VatStatusResponse;
import com.taxpadi.api.model.User;
import com.taxpadi.api.model.UserTaxProfile;
import com.taxpadi.api.model.VatRecord;
import com.taxpadi.api.repository.TransactionRepository;
import com.taxpadi.api.repository.UserTaxProfileRepository;
import com.taxpadi.api.repository.VatRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Behavioural guards for VatService that are not about the netting arithmetic:
 * filed returns must never be recomputed, and the registration-threshold warning
 * must fire at 80% of GHS 750,000 (i.e. GHS 600,000) and not below.
 */
@ExtendWith(MockitoExtension.class)
class VatServiceBehaviorTest {

    @Mock private VatRecordRepository vatRecordRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private UserTaxProfileRepository profileRepository;

    private final GhanaTaxEngine taxEngine = new GhanaTaxEngine();
    private VatService service;

    @BeforeEach
    void setUp() {
        service = new VatService(vatRecordRepository, taxEngine, transactionRepository, profileRepository);
    }

    // ── A filed return is never overwritten by a recompute ──

    @Test
    void recompute_filedReturn_isNotOverwritten() {
        User user = new User();
        UserTaxProfile profile = new UserTaxProfile();
        profile.setVatRegistered(true);

        VatRecord filed = new VatRecord();
        filed.setReturnStatus(VatReturnStatus.FILED);

        when(profileRepository.findByUser(any())).thenReturn(Optional.of(profile));
        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                any(), eq("income"), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(new BigDecimal("10000"));
        when(transactionRepository.sumDeductibleExpensesByUserAndDateRange(
                any(), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(new BigDecimal("4000"));
        when(vatRecordRepository.findByUserAndMonthAndYear(any(), anyInt(), anyInt()))
            .thenReturn(Optional.of(filed));

        service.recomputeVatForMonth(user, 3, 2026);

        verify(vatRecordRepository, never()).save(any());
    }

    // ── Threshold warning fires at 80% of the GHS 750,000 threshold ──

    @Test
    void status_atEightyPercentThreshold_warns() {
        VatStatusResponse response = statusWithAnnualRevenue(new BigDecimal("600000"));
        assertThat(response.getThresholdWarning()).isNotNull();
    }

    @Test
    void status_belowEightyPercentThreshold_noWarning() {
        VatStatusResponse response = statusWithAnnualRevenue(new BigDecimal("599999"));
        assertThat(response.getThresholdWarning()).isNull();
    }

    private VatStatusResponse statusWithAnnualRevenue(BigDecimal annualRevenue) {
        User user = new User();
        when(profileRepository.findByUser(any())).thenReturn(Optional.empty());
        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                any(), eq("income"), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(annualRevenue);
        when(vatRecordRepository.findByUserAndMonthAndYear(any(), anyInt(), anyInt()))
            .thenReturn(Optional.empty());
        return service.getStatus(user, 6, 2026);
    }
}
