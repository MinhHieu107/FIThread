package com.FIThread.FIThread.dashboard;

import java.time.Instant;
import java.util.List;

public final class DashboardDtos {

    private DashboardDtos() {}

    public record SentimentCounts(long positive, long neutral, long negative) {}

    public record ThemeStat(String theme, long count, long positive, long negative) {}

    public record CourseRow(
            Long courseId,
            String code,
            String name,
            long reviewCount,
            Double avgRating,
            long analyzedCount,
            long positive,
            long neutral,
            long negative,
            double negativeShare,
            boolean enoughData
    ) {}

    public record DashboardOverviewResponse(
            long totalReviews,
            long analyzedReviews,
            long pendingModeration,
            int minRequired,
            SentimentCounts sentiment,
            List<ThemeStat> topThemes,
            List<CourseRow> attentionCourses,
            List<CourseRow> courses
    ) {}

    public record CriterionStat(Long criterionId, String name, double average) {}

    public record SummaryView(
            String overview,
            List<String> strengths,
            List<String> improvements,
            int reviewsCovered,
            Instant generatedAt
    ) {}

    public record DashboardCourseResponse(
            Long courseId,
            String code,
            String name,
            int credits,
            String specialization,
            long reviewCount,
            long analyzedCount,
            int minRequired,
            boolean enoughData,
            Double avgRating,
            List<CriterionStat> criteria,
            SentimentCounts sentiment,
            Double avgSentimentScore,
            List<ThemeStat> themes,
            SummaryView summary
    ) {}
}