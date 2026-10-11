package com.FIThread.FIThread.review.dto;

import java.util.List;

public record CourseStatsResponse(
        long reviewCount,
        int minRequired,
        boolean hidden,
        Double overallAverage,
        List<CriterionStat> criteria
) {
    public record CriterionStat(Long criterionId, String name, double average) {}
}