package com.taxpadi.api.config;

import com.taxpadi.api.model.TaxRateConfig;
import com.taxpadi.api.repository.TaxRateConfigRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class TaxRateSeedRunner implements ApplicationRunner {

    private final TaxRateConfigRepository taxRateConfigRepository;

    public TaxRateSeedRunner(TaxRateConfigRepository taxRateConfigRepository) {
        this.taxRateConfigRepository = taxRateConfigRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (taxRateConfigRepository.count() > 0) return;

        TaxRateConfig config = new TaxRateConfig();
        config.setTaxYear(2025);
        config.setVatStandardRate(new BigDecimal("15"));
        config.setVatNhilLevy(new BigDecimal("2.5"));
        config.setVatGetfundLevy(new BigDecimal("2.5"));
        config.setVatCovidLevy(new BigDecimal("0"));
        config.setVatRegistrationThreshold(new BigDecimal("750000"));
        config.setIncomeTaxBrackets(List.of(
            bracket(1, "0",      "5880",   "0%",    "First GHS 5,880 annually"),
            bracket(2, "5881",   "7200",   "5%",    "Next GHS 1,320"),
            bracket(3, "7201",   "8760",   "10%",   "Next GHS 1,560"),
            bracket(4, "8761",   "46760",  "17.5%", "Next GHS 38,000"),
            bracket(5, "46761",  "238760", "25%",   "Next GHS 192,000"),
            bracket(6, "238761", "605000", "30%",   "Next GHS 366,240"),
            bracket(7, "605001", null,     "35%",   "Exceeding GHS 605,000")
        ));
        config.setWithholdingRates(List.of(
            wht("dividends",        "8%",   "Dividends paid to resident persons"),
            wht("interest",         "8%",   "Interest paid to resident persons"),
            wht("rent_residential", "8%",   "Rent on residential properties"),
            wht("rent_commercial",  "15%",  "Rent on commercial properties"),
            wht("royalties",        "15%",  "Royalties and natural resource payments"),
            wht("goods",            "3%",   "Supply of goods exceeding GHS 2,000"),
            wht("works",            "5%",   "Supply of works exceeding GHS 2,000"),
            wht("services",         "7.5%", "Supply of services exceeding GHS 2,000"),
            wht("director_fees",    "20%",  "Fees to resident directors and board members")
        ));

        taxRateConfigRepository.save(config);
    }

    private Map<String, Object> bracket(int num, String from, String to, String rate, String description) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("bracket", num);
        m.put("from", new BigDecimal(from));
        m.put("to", to != null ? new BigDecimal(to) : null);
        m.put("rate", rate);
        m.put("description", description);
        return m;
    }

    private Map<String, Object> wht(String category, String rate, String description) {
        return Map.of("category", category, "rate", rate, "description", description);
    }
}
