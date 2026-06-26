package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxpadi.api.exception.BadRequestException;

@Service
public class SpeechService {

    private static final String ASSEMBLYAI_UPLOAD = "https://api.assemblyai.com/v2/upload";
    private static final String ASSEMBLYAI_TRANSCRIPT = "https://api.assemblyai.com/v2/transcript";

    // Ghanaian local languages (tw=Twi, ga=Ga, ee=Ewe) are not yet supported by AssemblyAI;
    // they fall back to English. Hausa (ha) has partial support.
    private static final Map<String, String> LANGUAGE_MAP = Map.of(
        "en", "en",
        "ha", "en",  // Hausa — use English model as closest
        "tw", "en",  // Twi/Akan — fallback to English
        "ga", "en",  // Ga — fallback to English
        "ee", "en"   // Ewe — fallback to English
    );

    @Value("${assemblyai.api-key:}")
    private String assemblyAiApiKey;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SpeechResult transcribe(byte[] audioBytes, String language) {
        if (assemblyAiApiKey == null || assemblyAiApiKey.isBlank()) {
            throw new BadRequestException("Speech-to-text service is not configured");
        }

        // Step 1: Upload audio to AssemblyAI
        String uploadUrl = uploadAudio(audioBytes);

        // Step 2: Submit transcription job
        String languageCode = LANGUAGE_MAP.getOrDefault(language, "en");
        String transcriptId = submitTranscript(uploadUrl, languageCode);

        // Step 3: Poll until completed (max 30s for short audio)
        String transcription = pollForTranscript(transcriptId);

        // Step 4: Parse transcription for transaction data
        return parseTranscription(transcription);
    }

    private String uploadAudio(byte[] audioBytes) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                .uri(ASSEMBLYAI_UPLOAD)
                .header("Authorization", assemblyAiApiKey)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(audioBytes)
                .retrieve()
                .body(Map.class);

            return (String) response.get("upload_url");
        } catch (Exception e) {
            throw new BadRequestException("Could not understand the audio");
        }
    }

    private String submitTranscript(String audioUrl, String languageCode) {
        try {
            Map<String, Object> body = Map.of(
                "audio_url", audioUrl,
                "language_code", languageCode,
                "speech_models", List.of("universal-3-pro", "universal-2")
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                .uri(ASSEMBLYAI_TRANSCRIPT)
                .header("Authorization", assemblyAiApiKey)
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(Map.class);

            return (String) response.get("id");
        } catch (Exception e) {
            throw new BadRequestException("Could not understand the audio");
        }
    }

    private String pollForTranscript(String transcriptId) {
        int maxAttempts = 15;
        for (int i = 0; i < maxAttempts; i++) {
            try {
                Thread.sleep(2000);

                @SuppressWarnings("unchecked")
                Map<String, Object> response = restClient.get()
                    .uri(ASSEMBLYAI_TRANSCRIPT + "/" + transcriptId)
                    .header("Authorization", assemblyAiApiKey)
                    .retrieve()
                    .body(Map.class);

                String status = (String) response.get("status");

                if ("completed".equals(status)) {
                    return (String) response.get("text");
                } else if ("error".equals(status)) {
                    throw new BadRequestException("Could not understand the audio");
                }
            } catch (BadRequestException e) {
                throw e;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new BadRequestException("Could not understand the audio");
            } catch (Exception e) {
                throw new BadRequestException("Could not understand the audio");
            }
        }
        throw new BadRequestException("Could not understand the audio");
    }

    private SpeechResult parseTranscription(String transcription) {
        if (transcription == null || transcription.isBlank()) {
            throw new BadRequestException("Could not understand the audio");
        }

        String lower = transcription.toLowerCase();

        // Extract all amounts found in the transcription
        List<BigDecimal> allAmounts = extractAllAmounts(lower);
        if (allAmounts.isEmpty()) {
            throw new BadRequestException("Could not detect an amount in the audio");
        }

        // Use the largest amount as the primary (most likely the main transaction value)
        BigDecimal amount = allAmounts.stream().max(BigDecimal::compareTo).orElseThrow();

        // Determine transaction type from keywords
        boolean isIncome = lower.matches(".*(received|earned|paid me|income|sales|sold|sale|got paid|profit|salary|allowance).*");
        String type = isIncome ? "income" : "expense";

        // Determine category from keywords
        String category = inferCategory(lower, type);

        // Flag for review if: multiple amounts detected, hesitation words present, or transcription is long/complex
        boolean multipleAmounts = allAmounts.size() > 1;
        boolean hasHesitation = lower.matches(".*(um|uh|hmm|actually|i mean|wait|no|sorry).*");
        boolean needsReview = multipleAmounts || hasHesitation;
        String confidence = needsReview ? "low" : "high";

        SpeechResult result = new SpeechResult();
        result.transcription = transcription;
        result.amount = amount;
        result.type = type;
        result.category = category;
        result.description = transcription;
        result.confidence = confidence;
        result.needsReview = needsReview;
        return result;
    }

    private List<BigDecimal> extractAllAmounts(String text) {
        // Match: optional currency prefix, then number with optional thousand separators and decimal
        // Handles: 2,000 / 2000 / 1,300.50 / GHS 500 / 500 cedis
        Pattern pattern = Pattern.compile(
            "(?:ghs?|gh¢|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)\\s*(?:cedis?|ghc|ghs|gh¢|thousand|million)?",
            Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(text);
        List<BigDecimal> amounts = new java.util.ArrayList<>();
        while (matcher.find()) {
            try {
                String raw = matcher.group(1).replace(",", "");
                BigDecimal val = new BigDecimal(raw);
                if (val.compareTo(BigDecimal.ZERO) > 0) {
                    amounts.add(val);
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return amounts;
    }

    private String inferCategory(String text, String type) {
        if (text.contains("food") || text.contains("drink") || text.contains("restaurant") || text.contains("meal"))
            return "food_drinks";
        if (text.contains("transport") || text.contains("uber") || text.contains("trotro") || text.contains("fuel") || text.contains("taxi"))
            return "transport";
        if (text.contains("office") || text.contains("supplies") || text.contains("stationery"))
            return "supplies";
        if (text.contains("electricity") || text.contains("water") || text.contains("internet") || text.contains("utility"))
            return "utilities";
        if (text.contains("rent") || text.contains("lease"))
            return "rent_commercial";
        if (text.contains("equipment") || text.contains("laptop") || text.contains("phone") || text.contains("machine"))
            return "equipment";
        if (text.contains("service") || text.contains("consult") || text.contains("repair"))
            return "services";
        if (text.contains("client") || text.contains("customer") || text.contains("invoice") || text.contains("sales"))
            return type.equals("income") ? "sales_income" : "general_expense";
        return type.equals("income") ? "other_income" : "general_expense";
    }

    private String truncate(String s, int maxLen) {
        return s != null && s.length() > maxLen ? s.substring(0, maxLen) : s;
    }

    public static class SpeechResult {
        public String transcription;
        public BigDecimal amount;
        public String type;
        public String category;
        public String description;
        public String confidence;
        public boolean needsReview;
    }
}
