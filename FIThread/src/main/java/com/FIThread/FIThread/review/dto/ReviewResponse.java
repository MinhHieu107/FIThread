package com.FIThread.FIThread.review.dto;

import java.time.Instant;
import java.util.List;

public record ReviewResponse(
        Long id,
        Long offeringId,
        String lecturerName,
        String semester,
        String comment,
        Instant createdAt,
        List<ScoreView> scores,
        double average,
        boolean mine,
        String status
) {
    public record ScoreView(Long criterionId, String criterionName, int score) {}
}