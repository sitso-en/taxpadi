package com.taxpadi.api.service;

import com.taxpadi.api.dto.tax.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

    public TaxBracketsResponse getBrackets() {
        TaxBracketsResponse response = new TaxBracketsResponse();
        response.setTaxYear(TAX_YEAR);
        response.setCurrency(CURRENCY);
        response.setIncomeTaxBrackets(INCOME_TAX_BRACKETS);
        response.setLastUpdated(LocalDateTime.now());
        return response;
    }

    public TaxRatesResponse getRates() {
        TaxRatesResponse response = new TaxRatesResponse();
        response.setTaxYear(TAX_YEAR);
        response.setCurrency(CURRENCY);
        response.setIncomeTax(new IncomeTaxRateInfo(INCOME_TAX_BRACKETS, "April 30"));
        response.setVat(new VatRateInfo(
            "15%", "2.5%", "2.5%", "20%",
            new BigDecimal("750000"),
            "All service suppliers must register",
            "monthly",
            "Last working day of the following month"
        ));
        response.setPaye(new PayeRateInfo(INCOME_TAX_BRACKETS, "15th of the following month", "April 30"));
        response.setWithholding(new WithholdingRatesInfo(WHT_RATES));
        response.setPenalties(new PenaltiesInfo(
            "125% of statutory rate, compounded monthly",
            "125% of statutory rate, compounded monthly"
        ));
        response.setLastUpdated(LocalDateTime.now());
        return response;
    }

    private static BigDecimal bd(String val) {
        return new BigDecimal(val);
    }
}
