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

import java.util.Map;

@Service
public class SmsService {
    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    private static final String TERMII_URL = "https://api.ng.termii.com/api/sms/send";

    @Value("${termii.api-key}")
    private String apiKey;

    @Value("${termii.sender-id:Termii}")
    private String senderId;

    private final RestClient restClient = RestClient.create();

    public void sendOtp(String phone, String otpCode) {
        log.info("Sending OTP SMS to phone={}", phone);

        Map<String, Object> body = Map.of(
            "to", toInternational(phone),
            "from", senderId,
            "sms", "Your TaxPadi OTP is: " + otpCode + ". Don't share it with anyone.\nExpires after 10 minutes.",
            "type", "plain",
            "channel", "generic",
            "api_key", apiKey
        );

        try {
            ResponseEntity<String> response = restClient.post()
                .uri(TERMII_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(String.class);

            log.debug("Termii response: status={}", response.getStatusCode());
        } catch (RestClientResponseException ex) {
            log.error("Termii returned error status={} body={}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new RuntimeException("Failed to send OTP. Please try again.");
        } catch (ResourceAccessException ex) {
            log.error("Termii unreachable: {}", ex.getMessage());
            throw new RuntimeException("SMS service is currently unavailable. Please try again.");
        }
    }

    // Convert 0XXXXXXXXX or +233XXXXXXXXX to 233XXXXXXXXX (Termii format)
    private String toInternational(String phone) {
        if (phone.startsWith("+")) return phone.substring(1);
        if (phone.startsWith("0")) return "233" + phone.substring(1);
        return phone;
    }
}
