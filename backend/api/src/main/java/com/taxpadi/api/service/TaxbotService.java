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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class TaxbotService {

    private static final Logger log = LoggerFactory.getLogger(TaxbotService.class);
    private static final int RATE_LIMIT = 50;
    private static final String MODEL = "llama-3.3-70b-versatile";
    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String SYSTEM_PROMPT =
        "You are TaxBot, a Ghana tax assistant built into TaxPadi. " +
        "You help users understand GRA rules, PAYE, VAT, withholding tax, income tax brackets, deadlines, filing procedures " +
        "and any other questions regarding taxes, insurances, loans, banking and mostly anything to do with finance. " +
        "Keep answers concise and relevant to Ghana tax law. " +
        "Do not give advice on topics unrelated to taxation. " +
        "You can answer questions on taxation regarding other countries when the user wants to compare to Ghana.";

    private final TaxbotConversationRepository conversationRepository;
    private final RestClient restClient;

    @Value("${groq.api-key}")
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
            log.error("GROQ_API_KEY is not configured — TaxBot cannot function.");
            throw new BadRequestException("TaxBot is not available right now. Please try again later.");
        }

        Map<String, Object> requestBody = Map.of(
            "model", MODEL,
            "messages", List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", question)
            ),
            "max_tokens", 1024
        );

        Map<String, Object> response;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restClient.post()
                .uri(GROQ_URL)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .body(requestBody)
                .retrieve()
                .body(Map.class);
            response = raw;
        } catch (HttpClientErrorException e) {
            log.error("Groq API error {} — body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BadRequestException("TaxBot is temporarily unavailable. Please try again shortly.");
        } catch (RestClientException e) {
            log.error("Groq connection failed: {}", e.getMessage());
            throw new BadRequestException("TaxBot is temporarily unavailable. Please try again shortly.");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        @SuppressWarnings("unchecked")
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        String answer = (String) message.get("content");

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

    /** Permanently delete the user's entire TaxBot conversation history. */
    @Transactional
    public long clearHistory(User user) {
        return conversationRepository.deleteByUser(user);
    }
}
