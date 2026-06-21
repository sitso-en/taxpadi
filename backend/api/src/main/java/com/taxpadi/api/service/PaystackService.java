package com.taxpadi.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxpadi.api.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Service
public class PaystackService {

    private static final String BASE_URL = "https://api.paystack.co";

    @Value("${paystack.secret-key:}")
    private String secretKey;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaystackInitResult initialize(String email, BigDecimal amount, String reference, List<String> channels) {
        if (secretKey == null || secretKey.isBlank())
            throw new BadRequestException("Payment service is not configured");

        long pesewas = amount.multiply(BigDecimal.valueOf(100)).longValue();

        Map<String, Object> body = Map.of(
            "email", email,
            "amount", pesewas,
            "currency", "GHS",
            "reference", reference,
            "channels", channels
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                .uri(BASE_URL + "/transaction/initialize")
                .header("Authorization", "Bearer " + secretKey)
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            PaystackInitResult result = new PaystackInitResult();
            result.authorizationUrl = (String) data.get("authorization_url");
            result.reference = (String) data.get("reference");
            result.accessCode = (String) data.get("access_code");
            return result;
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Could not reach payment provider. Please try again.");
        }
    }

    public boolean isSuccessful(String reference) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                .uri(BASE_URL + "/transaction/verify/" + reference)
                .header("Authorization", "Bearer " + secretKey)
                .retrieve()
                .body(Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            return "success".equals(data.get("status"));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean validateSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    public ChargeResult chargeMobileMoney(String email, BigDecimal amount, String reference,
                                          String momoNumber, String provider) {
        if (secretKey == null || secretKey.isBlank())
            throw new BadRequestException("Payment service is not configured");

        long pesewas = amount.multiply(BigDecimal.valueOf(100)).longValue();

        Map<String, Object> body = Map.of(
            "email", email,
            "amount", pesewas,
            "currency", "GHS",
            "reference", reference,
            "mobile_money", Map.of("phone", momoNumber, "provider", provider)
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                .uri(BASE_URL + "/charge")
                .header("Authorization", "Bearer " + secretKey)
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            ChargeResult result = new ChargeResult();
            result.status = (String) data.get("status");
            result.reference = (String) data.get("reference");
            return result;
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Could not reach payment provider. Please try again.");
        }
    }

    public static class PaystackInitResult {
        public String authorizationUrl;
        public String reference;
        public String accessCode;
    }

    public static class ChargeResult {
        public String status;
        public String reference;
    }
}
