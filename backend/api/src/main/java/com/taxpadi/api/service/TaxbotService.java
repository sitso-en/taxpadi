package com.taxpadi.api.service;

import com.taxpadi.api.dto.taxbot.TaxbotAskResponse;
import com.taxpadi.api.dto.taxbot.TaxbotConversationItem;
import com.taxpadi.api.dto.taxbot.TaxbotHistoryResponse;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.TooManyRequestsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import com.taxpadi.api.model.TaxbotConversation;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.TaxbotConversationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class TaxbotService {

    private static final Logger log = LoggerFactory.getLogger(TaxbotService.class);
    private static final int RATE_LIMIT = 50;
    private static final String MODEL = "gemini-2.0-flash";
    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent";
    private static final String SYSTEM_PROMPT =
        "You are TaxBot, a Ghana tax assistant built into TaxPadi. " +
        "You help users understand GRA rules, PAYE, VAT, withholding tax, income tax brackets, deadlines, filing procedures " +
        "and any other questions regarding taxes, insurances, loans, banking and mostly anything to do with finance. " +
        "Keep answers concise and relevant to Ghana tax law. " +
        "Do not give advice on topics unrelated to taxation. " +
        "You can answer questions on taxation regarding other countries when the user wants to compare to Ghana.";

    private final TaxbotConversationRepository conversationRepository;
    private final RestClient restClient;

    @Value("${gemini.api-key}")
    private String apiKey;

    public TaxbotService(TaxbotConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
        this.restClient = RestClient.create();
    }

    public TaxbotAskResponse ask(User user, String question) {
        if (question == null || question.isBlank()) {
            throw new BadRequestException("Question cannot be empty.");
        }
        if (question.length() > 500) {
            throw new BadRequestException("Question must be 500 characters or fewer.");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dayStart = now.toLocalDate().atStartOfDay();

        int todayCount = conversationRepository.countByUserAndCreatedAtBetween(user, dayStart, now);
        if (todayCount >= RATE_LIMIT) {
            throw new TooManyRequestsException("Daily TaxBot limit of " + RATE_LIMIT + " questions reached.");
        }

        if (apiKey == null || apiKey.isBlank()) {
            log.error("GEMINI_API_KEY is not configured — TaxBot cannot function.");
            throw new BadRequestException("TaxBot is not available right now. Please try again later.");
        }

        Map<String, Object> requestBody = Map.of(
            "system_instruction", Map.of("parts", List.of(Map.of("text", SYSTEM_PROMPT))),
            "contents", List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", question))
            )),
            "generationConfig", Map.of("maxOutputTokens", 1024)
        );

        Map<String, Object> response;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restClient.post()
                .uri(GEMINI_URL + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .body(Map.class);
            response = raw;
        } catch (HttpClientErrorException e) {
            log.error("Gemini API error {} — body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BadRequestException("TaxBot is temporarily unavailable. Please try again shortly.");
        } catch (RestClientException e) {
            log.error("Gemini connection failed: {}", e.getMessage());
            throw new BadRequestException("TaxBot is temporarily unavailable. Please try again shortly.");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        @SuppressWarnings("unchecked")
        Map<String, Object> firstContent = (Map<String, Object>) candidates.get(0).get("content");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> parts = (List<Map<String, Object>>) firstContent.get("parts");
        String answer = (String) parts.get(0).get("text");

        TaxbotConversation conversation = new TaxbotConversation();
        conversation.setUser(user);
        conversation.setQuestion(question);
        conversation.setAnswer(answer);
        conversationRepository.save(conversation);

        return new TaxbotAskResponse(conversation.getConversationId(), question, answer, conversation.getCreatedAt());
    }

    public TaxbotHistoryResponse getHistory(User user, int page, int limit) {
        Page<TaxbotConversation> convPage = conversationRepository
            .findAllByUserOrderByCreatedAtDesc(user, PageRequest.of(page - 1, limit));

        List<TaxbotConversationItem> items = convPage.getContent().stream()
            .map(c -> new TaxbotConversationItem(
                c.getConversationId(),
                c.getQuestion(),
                c.getAnswer(),
                c.getCreatedAt()
            )).toList();

        return new TaxbotHistoryResponse(items, page, limit, convPage.getTotalElements(), convPage.getTotalPages());
    }
}
