package com.app.service;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.math.BigDecimal;
import java.util.Map;

@Service @RequiredArgsConstructor
public class PaystackClient {
    private final WebClient paystackWebClient;
    @Value("${paystack.callback-url}") private String callbackUrl;

    public Map initializeTransaction(String email, BigDecimal amountNaira, String reference) {
        long amountKobo = amountNaira.multiply(BigDecimal.valueOf(100)).longValue();
        Map<String,Object> body = Map.of(
                "email", email, "amount", amountKobo,
                "reference", reference, "callback_url", callbackUrl);
        return paystackWebClient.post().uri("/transaction/initialize")
                .bodyValue(body).retrieve().bodyToMono(Map.class).block();
    }

    public Map verifyTransaction(String reference) {
        return paystackWebClient.get().uri("/transaction/verify/" + reference)
                .retrieve().bodyToMono(Map.class).block();
    }
}
