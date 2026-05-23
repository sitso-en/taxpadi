package com.app;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
@SpringBootApplication
@EnableConfigurationProperties
public class SubscriptionApplication {
    public static void main(String[] args) { SpringApplication.run(SubscriptionApplication.class, args); }
}
