package com.taxpadi.api.dto.user;

import java.time.LocalDateTime;
import java.util.Map;

public class HealthScoreResponse {

    private int score;
    private String grade;
    private Map<String, Object> breakdown;
    private LocalDateTime lastCalculatedAt;

    public HealthScoreResponse(int score, String grade, Map<String, Object> breakdown, LocalDateTime lastCalculatedAt) {
        this.score = score;
        this.grade = grade;
        this.breakdown = breakdown;
        this.lastCalculatedAt = lastCalculatedAt;
    }


    public int getScore() {
        return score;
    }

    public String getGrade() {
        return grade;
    }

    public Map<String, Object> getBreakdown() {
        return breakdown;
    }

    public LocalDateTime getLastCalculatedAt() {
        return lastCalculatedAt;
    }
}