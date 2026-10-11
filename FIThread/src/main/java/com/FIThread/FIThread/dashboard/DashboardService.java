package com.FIThread.FIThread.dashboard;

import com.FIThread.FIThread.analysis.AnalysisStatus;
import com.FIThread.FIThread.analysis.Sentiment;
import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.course.Course;
import com.FIThread.FIThread.course.CourseRepository;
import com.FIThread.FIThread.dashboard.DashboardDtos.*;
import com.FIThread.FIThread.review.ReviewRepository;
import com.FIThread.FIThread.review.ReviewStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardStatsRepository statsRepository;
    private final CourseRepository courseRepository;
    private final CourseSummaryRepository summaryRepository;
    private final ReviewRepository reviewRepository;
    private final AppProperties appProperties;

    @Transactional(readOnly = true)
    public DashboardOverviewResponse overview() {
        int min = appProperties.getMinReviewsForStats();

        Map<Long, Tally> tallyByCourse = new HashMap<>();
        Tally overall = new Tally();
        for (Object[] r : statsRepository.analysisRows(AnalysisStatus.DONE, ReviewStatus.PUBLISHED)) {
            Sentiment sentiment = (Sentiment) r[1];
            Double score = (Double) r[2];
            tallyByCourse.computeIfAbsent((Long) r[0], k -> new Tally()).add(sentiment, score);
            overall.add(sentiment, score);
        }

        Map<String, ThemeTally> themeTallies = new HashMap<>();
        for (Object[] r : statsRepository.themeRows(AnalysisStatus.DONE, ReviewStatus.PUBLISHED)) {
            themeTallies.computeIfAbsent((String) r[1], k -> new ThemeTally()).add((Sentiment) r[2]);
        }

        List<Object[]> ratingRows = statsRepository.ratingByCourse(ReviewStatus.PUBLISHED);
        Map<Long, Course> courses = courseRepository
                .findAllById(ratingRows.stream().map(r -> (Long) r[0]).toList())
                .stream().collect(Collectors.toMap(Course::getId, c -> c));

        long totalReviews = 0;
        List<CourseRow> rows = new ArrayList<>();
        for (Object[] r : ratingRows) {
            Long courseId = (Long) r[0];
            Course course = courses.get(courseId);
            if (course == null) continue;

            long reviewCount = ((Number) r[1]).longValue();
            totalReviews += reviewCount;
            boolean enough = reviewCount >= min;
            Tally t = tallyByCourse.getOrDefault(courseId, new Tally());

            rows.add(new CourseRow(
                    courseId, course.getCode(), course.getName(), reviewCount,
                    enough ? round1((Double) r[2]) : null,
                    t.count(), t.positive, t.neutral, t.negative, round2(t.negativeShare()), enough));
        }
        rows.sort(Comparator.comparingLong(CourseRow::reviewCount).reversed().thenComparing(CourseRow::code));

        List<CourseRow> attention = rows.stream()
                .filter(CourseRow::enoughData)
                .sorted(Comparator.comparingDouble((CourseRow c) -> c.avgRating())
                        .thenComparing(Comparator.comparingDouble(CourseRow::negativeShare).reversed()))
                .limit(5)
                .toList();

        List<ThemeStat> topThemes = toThemeStats(themeTallies);

        return new DashboardOverviewResponse(
                totalReviews,
                overall.count(),
                reviewRepository.countByStatus(ReviewStatus.PENDING_MODERATION),
                min,
                new SentimentCounts(overall.positive, overall.neutral, overall.negative),
                topThemes,
                attention,
                rows);
    }

    @Transactional(readOnly = true)
    public DashboardCourseResponse courseDetail(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException("Khong tim thay mon hoc", HttpStatus.NOT_FOUND));
        int min = appProperties.getMinReviewsForStats();

        Tally tally = new Tally();
        for (Object[] r : statsRepository.analysisRows(AnalysisStatus.DONE, ReviewStatus.PUBLISHED)) {
            if (courseId.equals(r[0])) tally.add((Sentiment) r[1], (Double) r[2]);
        }

        Map<String, ThemeTally> themeTallies = new HashMap<>();
        for (Object[] r : statsRepository.themeRows(AnalysisStatus.DONE, ReviewStatus.PUBLISHED)) {
            if (courseId.equals(r[0])) {
                themeTallies.computeIfAbsent((String) r[1], k -> new ThemeTally()).add((Sentiment) r[2]);
            }
        }

        long reviewCount = 0;
        Double avgRating = null;
        for (Object[] r : statsRepository.ratingByCourse(ReviewStatus.PUBLISHED)) {
            if (courseId.equals(r[0])) {
                reviewCount = ((Number) r[1]).longValue();
                avgRating = (Double) r[2];
            }
        }

        boolean enough = reviewCount >= min;
        SentimentCounts sentiment = new SentimentCounts(tally.positive, tally.neutral, tally.negative);

        if (!enough) {
            return new DashboardCourseResponse(
                    courseId, course.getCode(), course.getName(), course.getCredits(), course.getSpecialization(),
                    reviewCount, tally.count(), min, false,
                    null, List.of(), sentiment, null, List.of(), null);
        }

        List<CriterionStat> criteria = reviewRepository.averageScoresByCourse(courseId, ReviewStatus.PUBLISHED).stream()
                .map(r -> new CriterionStat((Long) r[0], (String) r[1], round1((Double) r[2])))
                .toList();

        SummaryView summary = summaryRepository.findByCourseId(courseId)
                .map(s -> new SummaryView(
                        s.getOverview(), splitLines(s.getStrengths()), splitLines(s.getImprovements()),
                        s.getReviewsCovered(), s.getGeneratedAt()))
                .orElse(null);

        return new DashboardCourseResponse(
                courseId, course.getCode(), course.getName(), course.getCredits(), course.getSpecialization(),
                reviewCount, tally.count(), min, true,
                avgRating == null ? null : round1(avgRating),
                criteria, sentiment, tally.avgScore(), toThemeStats(themeTallies), summary);
    }

    // ---------- helpers ----------

    private static List<ThemeStat> toThemeStats(Map<String, ThemeTally> tallies) {
        return tallies.entrySet().stream()
                .map(e -> new ThemeStat(e.getKey(), e.getValue().count, e.getValue().positive, e.getValue().negative))
                .sorted(Comparator.comparingLong(ThemeStat::count).reversed())
                .toList();
    }

    private static List<String> splitLines(String text) {
        if (text == null || text.isBlank()) return List.of();
        return Arrays.stream(text.split("\n")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private static class Tally {
        long positive, neutral, negative;
        double scoreSum;

        void add(Sentiment s, Double score) {
            switch (s) {
                case POSITIVE -> positive++;
                case NEUTRAL -> neutral++;
                case NEGATIVE -> negative++;
            }
            if (score != null) scoreSum += score;
        }

        long count() {
            return positive + neutral + negative;
        }

        double negativeShare() {
            long c = count();
            return c == 0 ? 0 : (double) negative / c;
        }

        Double avgScore() {
            long c = count();
            return c == 0 ? null : round2(scoreSum / c);
        }
    }

    private static class ThemeTally {
        long count, positive, negative;

        void add(Sentiment s) {
            count++;
            if (s == Sentiment.POSITIVE) positive++;
            if (s == Sentiment.NEGATIVE) negative++;
        }
    }
}