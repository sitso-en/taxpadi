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

    private static final String MODEL = "gemini-2.0-flash";
    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent";

    @Value("${gemini.api-key}")
    private String apiKey;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OcrResult extractFromImage(byte[] imageBytes, String mediaType) {
        String base64 = Base64.getEncoder().encodeToString(imageBytes);

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of(
                "role", "user",
                "parts", List.of(
                    Map.of("inlineData", Map.of("mimeType", mediaType, "data", base64)),
                    Map.of("text",
                        "Extract transaction details from this receipt and respond with ONLY a JSON object in this exact format: " +
                        "{\"amount\":120.00,\"description\":\"Merchant - item description\",\"category\":\"general_expense\",\"transaction_date\":\"2024-01-15\",\"confidence\":\"high\"} " +
                        "category must be one of: supplies, food_drinks, transport, utilities, equipment, rent_commercial, services, general_expense. " +
                        "confidence must be: high (clear image, all fields visible), medium (some fields unclear), low (poor image quality). " +
                        "Use today's date if transaction_date is not visible. Return only the JSON, no other text."
                    )
                )
            )),
            "generationConfig", Map.of("maxOutputTokens", 300)
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                .uri(GEMINI_URL + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .body(Map.class);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            @SuppressWarnings("unchecked")
            Map<String, Object> firstContent = (Map<String, Object>) candidates.get(0).get("content");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> parts = (List<Map<String, Object>>) firstContent.get("parts");
            String jsonText = (String) parts.get(0).get("text");

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
