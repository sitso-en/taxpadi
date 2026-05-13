package com.taxpadi.api.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class SmsService {
    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    @Value("${arkesel.api.key}")
    private String apiKey;

    @Value("${arkesel.sms.sender}")
    private String sender;

    private final RestClient restClient = RestClient.create();

    public void sendOtp(String phone, String otpCode) {
        log.info("Sending OTP SMS to phone={}", phone);
        Map<String, Object> body = Map.of(
            "sender", sender,
            "message", "Your TaxPadi OTP is: " + otpCode + ". Valid for 10 minutes.",
            "recipients", List.of(phone)
        );

        try {
            ResponseEntity<String> response = restClient.post()
                .uri("https://sms.arkesel.com/api/v2/sms/send")
                .header("api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(String.class);

            log.debug("Arkesel response: status={}", response.getStatusCode());
        } catch (RestClientResponseException ex) {
            log.error("Arkesel returned error status={}", ex.getStatusCode());
            throw new RuntimeException("Failed to send OTP. Please try again.");
        } catch (ResourceAccessException ex) {
            log.error("Arkesel unreachable: {}", ex.getMessage());
            throw new RuntimeException("SMS service is currently unavailable. Please try again.");
        }
    }
}
