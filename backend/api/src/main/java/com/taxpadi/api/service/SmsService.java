package com.taxpadi.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SmsService {
    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    private static final String WIGAL_URL = "https://frogapi.wigal.com.gh/api/v3/sms/send";

    @Value("${wigal.api-key}")
    private String apiKey;

    @Value("${wigal.username}")
    private String username;

    @Value("${wigal.sender-id:TaxPadi}")
    private String senderId;

    private final RestClient restClient = RestClient.create();

    public void sendOtp(String phone, String otpCode) {
        log.info("Sending OTP SMS to phone={}", phone);

        Map<String, Object> body = Map.of(
            "senderid", senderId,
            "destinations", List.of(Map.of(
                "destination", toInternational(phone),
                "msgid", UUID.randomUUID().toString()
            )),
            "message", "Your TaxPadi OTP is: " + otpCode + ". Don't share it with anyone. Expires after 10 minutes.",
            "smstype", "text"
        );

        try {
            ResponseEntity<String> response = restClient.post()
                .uri(WIGAL_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .header("API-KEY", apiKey)
                .header("USERNAME", username)
                .body(body)
                .retrieve()
                .toEntity(String.class);

            log.debug("Wigal Frog response: status={}", response.getStatusCode());
        } catch (RestClientResponseException ex) {
            log.error("Wigal Frog returned error status={} body={}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new RuntimeException("Failed to send OTP. Please try again.");
        } catch (ResourceAccessException ex) {
            log.error("Wigal Frog unreachable: {}", ex.getMessage());
            throw new RuntimeException("SMS service is currently unavailable. Please try again.");
        }
    }

    // Convert 0XXXXXXXXX or +233XXXXXXXXX to 233XXXXXXXXX
    private String toInternational(String phone) {
        if (phone.startsWith("+")) return phone.substring(1);
        if (phone.startsWith("0")) return "233" + phone.substring(1);
        return phone;
    }
}
