package com.taxpadi.api.service;

import com.taxpadi.api.dto.tax.TaxBracketDto;
import com.taxpadi.api.dto.tax.WhtRateDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class TaxRateService {

    private static final int TAX_YEAR = 2025;
    private static final String CURRENCY = "GHS";

    private static final List<TaxBracketDto> INCOME_TAX_BRACKETS = List.of(
        new TaxBracketDto(1, bd("0"),      bd("5880"),   "0%",    "First GHS 5,880 annually"),
        new TaxBracketDto(2, bd("5881"),   bd("7200"),   "5%",    "Next GHS 1,320"),
        new TaxBracketDto(3, bd("7201"),   bd("8760"),   "10%",   "Next GHS 1,560"),
        new TaxBracketDto(4, bd("8761"),   bd("46760"),  "17.5%", "Next GHS 38,000"),
        new TaxBracketDto(5, bd("46761"),  bd("238760"), "25%",   "Next GHS 192,000"),
        new TaxBracketDto(6, bd("238761"), bd("605000"), "30%",   "Next GHS 366,240"),
        new TaxBracketDto(7, bd("605001"), null,         "35%",   "Exceeding GHS 605,000")
    );

    private static final List<WhtRateDto> WHT_RATES = List.of(
        new WhtRateDto("dividends",        "8%",   "Dividends paid to resident persons"),
        new WhtRateDto("interest",         "8%",   "Interest paid to resident persons"),
        new WhtRateDto("rent_residential", "8%",   "Rent on residential properties"),
        new WhtRateDto("rent_commercial",  "15%",  "Rent on commercial properties"),
        new WhtRateDto("royalties",        "15%",  "Royalties and natural resource payments"),
        new WhtRateDto("goods",            "3%",   "Supply of goods exceeding GHS 2,000"),
        new WhtRateDto("works",            "5%",   "Supply of works exceeding GHS 2,000"),
        new WhtRateDto("services",         "7.5%", "Supply of services exceeding GHS 2,000"),
        new WhtRateDto("director_fees",    "20%",  "Fees to resident directors and board members")
    );

    public Map<String, Object> getBrackets() {
        return Map.of(
            "tax_year", TAX_YEAR,
            "currency", CURRENCY,
            "income_tax_brackets", INCOME_TAX_BRACKETS,
            "last_updated", LocalDateTime.now()
        );
    }

    public Map<String, Object> getRates() {
        return Map.of(
            "tax_year", TAX_YEAR,
            "currency", CURRENCY,
            "income_tax", Map.of(
                "brackets", INCOME_TAX_BRACKETS,
                "filing_deadline", "April 30"
            ),
            "vat", Map.of(
                "standard_rate", "15%",
                "nhil_levy", "2.5%",
                "getfund_levy", "2.5%",
                "effective_rate", "20%",
                "registration_threshold_goods", 750000.00,
                "registration_threshold_services", "All service suppliers must register",
                "filing_frequency", "monthly",
                "filing_deadline", "Last working day of the following month"
            ),
            "paye", Map.of(
                "brackets", INCOME_TAX_BRACKETS,
                "remittance_deadline", "15th of the following month",
                "annual_return_deadline", "April 30"
            ),
            "withholding", Map.of(
                "rates", WHT_RATES
            ),
            "penalties", Map.of(
                "late_payment_rate", "125% of statutory rate, compounded monthly",
                "paye_late_remittance", "125% of statutory rate, compounded monthly"
            ),
            "last_updated", LocalDateTime.now()
        );
    }

    private static BigDecimal bd(String val) {
        return new BigDecimal(val);
    }
}
