package com.taxpadi.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxpadi.api.exception.BadRequestException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class OcrService {

    private static final String MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Value("${groq.api-key}")
    private String apiKey;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OcrResult extractFromImage(byte[] imageBytes, String mediaType) {
        String base64 = Base64.getEncoder().encodeToString(imageBytes);

        String prompt =
            "Extract transaction details from this receipt and respond with ONLY a JSON object in this exact format: " +
            "{\"amount\":120.00,\"description\":\"Merchant - item description\",\"category\":\"general_expense\",\"transaction_date\":\"2024-01-15\",\"confidence\":\"high\"} " +
            "category must be one of: supplies, food_drinks, transport, utilities, equipment, rent_commercial, services, general_expense. " +
            "confidence must be: high (clear image, all fields visible), medium (some fields unclear), low (poor image quality). " +
            "Use today's date if transaction_date is not visible. Return only the JSON, no other text.";

        Map<String, Object> requestBody = Map.of(
            "model", MODEL,
            "messages", List.of(Map.of(
                "role", "user",
                "content", List.of(
                    Map.of("type", "text", "text", prompt),
                    Map.of("type", "image_url", "image_url",
                        Map.of("url", "data:" + mediaType + ";base64," + base64))
                )
            )),
            "max_tokens", 300
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                .uri(GROQ_URL)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String jsonText = (String) message.get("content");

            // Extract JSON from response (model may wrap it in backticks)
            jsonText = jsonText.trim();
            if (jsonText.startsWith("```")) {
                jsonText = jsonText.replaceAll("```[a-z]*\\n?", "").replaceAll("```", "").trim();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> extracted = objectMapper.readValue(jsonText, Map.class);

            OcrResult result = new OcrResult();
            result.amount = new BigDecimal(extracted.get("amount").toString());
            result.description = (String) extracted.get("description");
            result.category = (String) extracted.get("category");
            result.confidence = (String) extracted.getOrDefault("confidence", "medium");

            Object dateObj = extracted.get("transaction_date");
            result.transactionDate = dateObj != null && !dateObj.toString().isBlank()
                ? LocalDate.parse(dateObj.toString())
                : LocalDate.now();

            result.needsReview = "low".equals(result.confidence);
            return result;

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("The receipt could not be read. Please ensure the image is clear");
        }
    }

    public static class OcrResult {
        public BigDecimal amount;
        public String description;
        public String category;
        public LocalDate transactionDate;
        public String confidence;
        public boolean needsReview;
    }
}
