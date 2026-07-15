package com.taxpadi.api.dto.penalty;

import java.util.List;

public class PenaltyGuidance {

    private String message;
    private List<String> steps;

    public PenaltyGuidance(String message, List<String> steps) {
        this.message = message;
        this.steps = steps;
    }

    public String getMessage() { return message; }
    public List<String> getSteps() { return steps; }
}
