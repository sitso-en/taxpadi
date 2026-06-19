package com.taxpadi.api.service;

import com.taxpadi.api.dto.admin.AdminUpdateTaxRatesRequest;
import com.taxpadi.api.dto.admin.AdminUpdateTaxRatesResponse;
import com.taxpadi.api.dto.tax.*;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.TaxRateConfig;
import com.taxpadi.api.repository.TaxRateConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class TaxRateService {

    private static final String CURRENCY = "GHS";

    private final TaxRateConfigRepository taxRateConfigRepository;

    public TaxRateService(TaxRateConfigRepository taxRateConfigRepository) {
        this.taxRateConfigRepository = taxRateConfigRepository;
    }

    public TaxBracketsResponse getBrackets() {
        TaxRateConfig config = latestConfig();

        TaxBracketsResponse response = new TaxBracketsResponse();
        response.setTaxYear(config.getTaxYear());
        response.setCurrency(CURRENCY);
        response.setIncomeTaxBrackets(toBracketDtos(config.getIncomeTaxBrackets()));
        response.setLastUpdated(config.getUpdatedAt());
        return response;
    }

    public TaxRatesResponse getRates() {
        TaxRateConfig config = latestConfig();

        List<TaxBracketDto> brackets = toBracketDtos(config.getIncomeTaxBrackets());
        List<WhtRateDto> whtRates = toWhtDtos(config.getWithholdingRates());

        BigDecimal vatStandard  = config.getVatStandardRate();
        BigDecimal vatNhil      = config.getVatNhilLevy();
        BigDecimal vatGetfund   = config.getVatGetfundLevy();
        BigDecimal vatThreshold = config.getVatRegistrationThreshold();
        BigDecimal effective    = vatStandard.add(vatNhil).add(vatGetfund);

        TaxRatesResponse response = new TaxRatesResponse();
        response.setTaxYear(config.getTaxYear());
        response.setCurrency(CURRENCY);
        response.setIncomeTax(new IncomeTaxRateInfo(brackets, "April 30"));
        response.setVat(new VatRateInfo(
                formatPct(vatStandard), formatPct(vatNhil), formatPct(vatGetfund),
                formatPct(effective), vatThreshold,
                "All service suppliers must register", "monthly",
                "Last working day of the following month"));
        response.setPaye(new PayeRateInfo(brackets, "15th of the following month", "April 30"));
        response.setWithholding(new WithholdingRatesInfo(whtRates));
        response.setPenalties(new PenaltiesInfo(
                "125% of statutory rate, compounded monthly",
                "125% of statutory rate, compounded monthly"));
        response.setLastUpdated(config.getUpdatedAt());
        return response;
    }

    @Transactional
    public AdminUpdateTaxRatesResponse updateRates(AdminUpdateTaxRatesRequest request, UUID updatedBy) {
        TaxRateConfig config = taxRateConfigRepository.findByTaxYear(request.getTaxYear())
                .orElseGet(TaxRateConfig::new);

        config.setTaxYear(request.getTaxYear());
        config.setUpdatedBy(updatedBy);
        config.setUpdatedAt(LocalDateTime.now());

        if (request.getIncomeTaxBrackets() != null)
            config.setIncomeTaxBrackets(toMaps(request.getIncomeTaxBrackets()));
        if (request.getVatStandardRate() != null)
            config.setVatStandardRate(request.getVatStandardRate());
        if (request.getVatNhilLevy() != null)
            config.setVatNhilLevy(request.getVatNhilLevy());
        if (request.getVatGetfundLevy() != null)
            config.setVatGetfundLevy(request.getVatGetfundLevy());
        if (request.getVatCovidLevy() != null)
            config.setVatCovidLevy(request.getVatCovidLevy());
        if (request.getVatRegistrationThreshold() != null)
            config.setVatRegistrationThreshold(request.getVatRegistrationThreshold());
        if (request.getWithholdingRates() != null)
            config.setWithholdingRates(toWhtMaps(request.getWithholdingRates()));

        taxRateConfigRepository.save(config);
        return new AdminUpdateTaxRatesResponse(config.getTaxYear(), config.getUpdatedAt(), updatedBy);
    }


    private TaxRateConfig latestConfig() {
        return taxRateConfigRepository.findTopByOrderByTaxYearDesc()
                .orElseThrow(() -> new NotFoundException("No tax rate configuration found."));
    }

    private List<TaxBracketDto> toBracketDtos(List<Map<String, Object>> maps) {
        return maps.stream().map(m -> new TaxBracketDto(
                ((Number) m.get("bracket")).intValue(),
                new BigDecimal(m.get("from").toString()),
                m.get("to") != null ? new BigDecimal(m.get("to").toString()) : null,
                (String) m.get("rate"),
                (String) m.get("description")
        )).toList();
    }

    private List<WhtRateDto> toWhtDtos(List<Map<String, Object>> maps) {
        return maps.stream().map(m -> new WhtRateDto(
                (String) m.get("category"),
                (String) m.get("rate"),
                (String) m.get("description")
        )).toList();
    }

    private List<Map<String, Object>> toMaps(List<TaxBracketDto> dtos) {
        return dtos.stream().map(d -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("bracket", d.getBracket());
            m.put("from", d.getFrom());
            m.put("to", d.getTo());
            m.put("rate", d.getRate());
            m.put("description", d.getDescription());
            return m;
        }).toList();
    }

    private List<Map<String, Object>> toWhtMaps(List<WhtRateDto> dtos) {
        return dtos.stream().map(d -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("category", d.getCategory());
            m.put("rate", d.getRate());
            m.put("description", d.getDescription());
            return m;
        }).toList();
    }

    private String formatPct(BigDecimal val) {
        return val.stripTrailingZeros().toPlainString() + "%";
    }
}
