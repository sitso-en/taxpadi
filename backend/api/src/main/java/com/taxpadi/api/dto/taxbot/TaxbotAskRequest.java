package com.taxpadi.api.dto.taxbot;

import jakarta.validation.constraints.NotBlank;

public class TaxbotAskRequest {

    @NotBlank(message = "Question is required")
    private String question;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
}
