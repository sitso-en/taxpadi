package com.taxpadi.api.service;

import com.taxpadi.api.model.User;
import com.taxpadi.api.model.UserTaxProfile;
import com.taxpadi.api.model.VatRecord;
import com.taxpadi.api.repository.TransactionRepository;
import com.taxpadi.api.repository.UserTaxProfileRepository;
import com.taxpadi.api.repository.VatRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Guards the VAT netting rule under Act 1151: only the 15% VAT is recoverable as
 * an input credit. NHIL and GETFund (2.5% each) are levies on output supplies and
 * must NOT be offset by input VAT.
 *
 * Regression this protects against:
 *   The old code computed net = (sales - purchases) * 20%, which wrongly allowed
 *   the levies on purchases to cancel the levies on sales, understating liability.
 */
@ExtendWith(MockitoExtension.class)
class VatServiceNettingTest {

    @Mock private VatRecordRepository vatRecordRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private UserTaxProfileRepository profileRepository;

    private final GhanaTaxEngine taxEngine = new GhanaTaxEngine();
    private VatService service;

    @BeforeEach
    void setUp() {
        service = new VatService(vatRecordRepository, taxEngine, transactionRepository, profileRepository);
    }

    // ── Positive: levies are added in full on output, only VAT is netted ──

    @Test
    void recompute_leviesAreNotOffsetByInputVat() {
        User user = new User();
        UserTaxProfile profile = new UserTaxProfile();
        profile.setVatRegistered(true);

        when(profileRepository.findByUser(any())).thenReturn(Optional.of(profile));
        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                any(), eq("income"), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(new BigDecimal("10000"));
        when(transactionRepository.sumDeductibleExpensesByUserAndDateRange(
                any(), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(new BigDecimal("4000"));
        when(vatRecordRepository.findByUserAndMonthAndYear(any(), anyInt(), anyInt()))
            .thenReturn(Optional.empty());

        service.recomputeVatForMonth(user, 3, 2026);

        ArgumentCaptor<VatRecord> captor = ArgumentCaptor.forClass(VatRecord.class);
        verify(vatRecordRepository).save(captor.capture());
        VatRecord saved = captor.getValue();

        // 15% VAT only is recoverable
        assertThat(saved.getOutputVat()).isEqualByComparingTo("1500.00");
        assertThat(saved.getInputVat()).isEqualByComparingTo("600.00");

        // net = (1500 - 600) VAT + 250 NHIL + 250 GETFund = 1400
        assertThat(saved.getNetVatLiability()).isEqualByComparingTo("1400.00");

        // The old (sales - purchases) * 20% formula would have produced 1200
        assertThat(saved.getNetVatLiability()).isNotEqualByComparingTo("1200.00");
    }

    // ── VAT-credit position: input VAT exceeds output, but levies are still due ──

    @Test
    void recompute_inputExceedsOutput_leviesStillCharged() {
        User user = new User();
        UserTaxProfile profile = new UserTaxProfile();
        profile.setVatRegistered(true);

        when(profileRepository.findByUser(any())).thenReturn(Optional.of(profile));
        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(
                any(), eq("income"), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(new BigDecimal("1000"));
        when(transactionRepository.sumDeductibleExpensesByUserAndDateRange(
                any(), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(new BigDecimal("5000"));
        when(vatRecordRepository.findByUserAndMonthAndYear(any(), anyInt(), anyInt()))
            .thenReturn(Optional.empty());

        service.recomputeVatForMonth(user, 3, 2026);

        ArgumentCaptor<VatRecord> captor = ArgumentCaptor.forClass(VatRecord.class);
        verify(vatRecordRepository).save(captor.capture());
        VatRecord saved = captor.getValue();

        // VAT portion floors at zero: max(150 - 750, 0) = 0
        // levies still due on output sales: 25 NHIL + 25 GETFund = 50
        assertThat(saved.getNetVatLiability()).isEqualByComparingTo("50.00");
    }

    // ── Negative: an unregistered user is never touched ──

    @Test
    void recompute_unregisteredUser_doesNothing() {
        User user = new User();
        UserTaxProfile profile = new UserTaxProfile();
        profile.setVatRegistered(false);
        when(profileRepository.findByUser(any())).thenReturn(Optional.of(profile));

        service.recomputeVatForMonth(user, 3, 2026);

        verify(vatRecordRepository, never()).save(any());
        verifyNoInteractions(transactionRepository);
    }
}
