package com.taxpadi.api.service;

import com.taxpadi.api.dto.tax.TaxBracketDto;
import com.taxpadi.api.dto.tax.TaxRatesResponse;
import com.taxpadi.api.model.TaxRateConfig;
import com.taxpadi.api.repository.TaxRateConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Consistency guard: the monthly PAYE brackets surfaced by TaxRateService (derived
 * from the stored annual brackets ÷ 12) must line up with the cumulative band
 * boundaries hardcoded in GhanaTaxEngine.PAYE_BRACKETS
 * (490, 600, 730, 3,897, 19,897, 50,417). If the two ever drift, the app would
 * display one schedule while calculating another.
 */
@ExtendWith(MockitoExtension.class)
class TaxRateBracketConsistencyTest {

    @Mock private TaxRateConfigRepository taxRateConfigRepository;

    private TaxRateService service;

    @BeforeEach
    void setUp() {
        service = new TaxRateService(taxRateConfigRepository);
    }

    @Test
    void monthlyPayeBrackets_matchEngineBoundaries() {
        when(taxRateConfigRepository.findTopByOrderByTaxYearDesc())
            .thenReturn(Optional.of(annualConfig()));

        TaxRatesResponse rates = service.getRates();
        List<TaxBracketDto> paye = rates.getPaye().getBrackets();

        List<BigDecimal> upperBounds = paye.stream().map(TaxBracketDto::getTo).toList();

        assertThat(upperBounds.get(0)).isEqualByComparingTo("490");
        assertThat(upperBounds.get(1)).isEqualByComparingTo("600");
        assertThat(upperBounds.get(2)).isEqualByComparingTo("730");
        assertThat(upperBounds.get(3)).isEqualByComparingTo("3897");
        assertThat(upperBounds.get(4)).isEqualByComparingTo("19897");
        assertThat(upperBounds.get(5)).isEqualByComparingTo("50417");
        assertThat(upperBounds.get(6)).isNull(); // open-ended top band
    }

    /** Annual resident income-tax brackets (cumulative from/to), matching the seed. */
    private TaxRateConfig annualConfig() {
        List<Map<String, Object>> brackets = new ArrayList<>();
        brackets.add(bracket(1, 0, 5880, "0%"));
        brackets.add(bracket(2, 5881, 7200, "5%"));
        brackets.add(bracket(3, 7201, 8760, "10%"));
        brackets.add(bracket(4, 8761, 46760, "17.5%"));
        brackets.add(bracket(5, 46761, 238760, "25%"));
        brackets.add(bracket(6, 238761, 605000, "30%"));
        brackets.add(bracket(7, 605001, null, "35%"));

        TaxRateConfig config = new TaxRateConfig();
        config.setTaxYear(2025);
        config.setIncomeTaxBrackets(brackets);
        config.setVatStandardRate(new BigDecimal("15"));
        config.setVatNhilLevy(new BigDecimal("2.5"));
        config.setVatGetfundLevy(new BigDecimal("2.5"));
        config.setVatRegistrationThreshold(new BigDecimal("750000"));
        config.setWithholdingRates(new ArrayList<>());
        config.setUpdatedAt(LocalDateTime.of(2025, 1, 1, 0, 0));
        return config;
    }

    private Map<String, Object> bracket(int bracket, Integer from, Integer to, String rate) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("bracket", bracket);
        m.put("from", from);
        m.put("to", to);
        m.put("rate", rate);
        m.put("description", "band " + bracket);
        return m;
    }
}
