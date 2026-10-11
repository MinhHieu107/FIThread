package com.FIThread.FIThread.review.dto;

import java.time.Instant;
import java.util.List;

public record ModerationReviewResponse(
        Long id,
        String courseCode,
        String courseName,
        String lecturerName,
        String semester,
        String comment,
        String status,
        Instant createdAt,
        int reportCount,
        List<String> reasons
) {}