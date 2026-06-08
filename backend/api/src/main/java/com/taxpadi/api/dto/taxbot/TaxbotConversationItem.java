package com.taxpadi.api.dto.taxbot;

import java.time.LocalDateTime;
import java.util.UUID;

public class TaxbotConversationItem {

    private UUID conversationId;
    private String question;
    private String answer;
    private LocalDateTime createdAt;

    public TaxbotConversationItem(UUID conversationId, String question, String answer, LocalDateTime createdAt) {
        this.conversationId = conversationId;
        this.question = question;
        this.answer = answer;
        this.createdAt = createdAt;
    }

    public UUID getConversationId() { return conversationId; }
    public void setConversationId(UUID conversationId) { this.conversationId = conversationId; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
