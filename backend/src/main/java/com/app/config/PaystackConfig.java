package com.app.config;
import lombok.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration @ConfigurationProperties(prefix="paystack") @Getter @Setter
public class PaystackConfig {
    private String secretKey;
    private String baseUrl;
    private String callbackUrl;

    @Bean
    public WebClient paystackWebClient() {
        return WebClient.builder().baseUrl(baseUrl)
                .defaultHeader("Authorization","Bearer "+secretKey)
                .defaultHeader("Content-Type","application/json").build();
    }
}
