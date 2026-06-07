package com.taxpadi.api.service;

import com.taxpadi.api.dto.taxbot.TaxbotAskResponse;
import com.taxpadi.api.dto.taxbot.TaxbotConversationItem;
import com.taxpadi.api.dto.taxbot.TaxbotHistoryResponse;
import com.taxpadi.api.exception.BadRequestException;
import com.taxpadi.api.exception.TooManyRequestsException;
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

    private static final int RATE_LIMIT = 50;
    private static final String MODEL = "claude-haiku-4-5-20251001";
    private static final String SYSTEM_PROMPT = """
        You are TaxBot, a Ghana tax assistant built into TaxPadi. \
        You help users understand GRA rules, PAYE, VAT, withholding tax, income tax brackets, deadlines, filing procedures and any other questions regarding taxes, insurances, loans, banking and mostly anything to do with finance \
        You should keep answers concise and relevant to Ghana tax law. \
        Do not give advice on topics unrelated to taxation.\
        You can answer questions on taxation regarding other countries, like in case the user wants to compare the Ghana tax operations to that of other countries
        """;

    private final TaxbotConversationRepository conversationRepository;
    private final RestClient restClient;

    @Value("${anthropic.api-key}")
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

        Map<String, Object> requestBody = Map.of(
            "model", MODEL,
            "max_tokens", 1024,
            "system", SYSTEM_PROMPT,
            "messages", List.of(Map.of("role", "user", "content", question))
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restClient.post()
            .uri("https://api.anthropic.com/v1/messages")
            .header("x-api-key", apiKey)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .body(requestBody)
            .retrieve()
            .body(Map.class);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
        String answer = (String) content.get(0).get("text");

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
