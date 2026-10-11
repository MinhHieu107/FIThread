package com.FIThread.FIThread.dashboard;

import com.FIThread.FIThread.analysis.*;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.course.Course;
import com.FIThread.FIThread.course.CourseRepository;
import com.FIThread.FIThread.review.Review;
import com.FIThread.FIThread.review.ReviewRepository;
import com.FIThread.FIThread.review.ReviewStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseSummaryService {

    private static final int MAX_COMMENTS = 40;
    private static final int MAX_COMMENT_LENGTH = 500;

    private final DashboardStatsRepository statsRepository;
    private final CourseSummaryRepository summaryRepository;
    private final CourseRepository courseRepository;
    private final ReviewRepository reviewRepository;
    private final AppProperties appProperties;

    public record SummaryJob(Long courseId, int eligibleCount, CourseSummaryInput input) {}

    @Transactional(readOnly = true)
    public List<Long> findStaleCourseIds() {
        int min = appProperties.getMinReviewsForStats();

        Map<Long, Integer> counts = new HashMap<>();
        Map<Long, Instant> latest = new HashMap<>();
        for (Object[] r : statsRepository.analysisRows(AnalysisStatus.DONE, ReviewStatus.PUBLISHED)) {
            Long courseId = (Long) r[0];
            counts.merge(courseId, 1, Integer::sum);
            Instant analyzedAt = (Instant) r[3];
            if (analyzedAt != null) latest.merge(courseId, analyzedAt, (a, b) -> a.isAfter(b) ? a : b);
        }

        Map<Long, CourseSummary> existing = summaryRepository.findAll().stream()
                .collect(Collectors.toMap(s -> s.getCourse().getId(), s -> s));

        List<Long> stale = new ArrayList<>();
        for (Map.Entry<Long, Integer> e : counts.entrySet()) {
            Long courseId = e.getKey();
            if (e.getValue() < min) continue;

            CourseSummary s = existing.get(courseId);
            Instant lastAnalyzed = latest.get(courseId);
            if (s == null
                    || s.getReviewsCovered() != e.getValue()
                    || (lastAnalyzed != null && lastAnalyzed.isAfter(s.getGeneratedAt()))) {
                stale.add(courseId);
            }
        }
        return stale;
    }

    @Transactional(readOnly = true)
    public Optional<SummaryJob> buildJob(Long courseId) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return Optional.empty();

        int positive = 0, neutral = 0, negative = 0;
        for (Object[] r : statsRepository.analysisRows(AnalysisStatus.DONE, ReviewStatus.PUBLISHED)) {
            if (!courseId.equals(r[0])) continue;
            switch ((Sentiment) r[1]) {
                case POSITIVE -> positive++;
                case NEUTRAL -> neutral++;
                case NEGATIVE -> negative++;
            }
        }
        int eligible = positive + neutral + negative;
        if (eligible == 0) return Optional.empty();

        Map<String, Integer> themeCounts = new HashMap<>();
        for (Object[] r : statsRepository.themeRows(AnalysisStatus.DONE, ReviewStatus.PUBLISHED)) {
            if (courseId.equals(r[0])) themeCounts.merge((String) r[1], 1, Integer::sum);
        }
        List<String> topThemes = themeCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(e -> PromptTemplates.THEME_LABELS.getOrDefault(e.getKey(), e.getKey()) + " (" + e.getValue() + ")")
                .toList();

        Map<String, Double> criteria = new LinkedHashMap<>();
        for (Object[] r : reviewRepository.averageScoresByCourse(courseId, ReviewStatus.PUBLISHED)) {
            criteria.put((String) r[1], Math.round((Double) r[2] * 10.0) / 10.0);
        }

        List<String> comments = reviewRepository
                .findByOfferingCourseIdAndStatusOrderByCreatedAtDesc(courseId, ReviewStatus.PUBLISHED,
                        PageRequest.of(0, MAX_COMMENTS))
                .getContent().stream()
                .map(Review::getComment)
                .map(c -> c.length() <= MAX_COMMENT_LENGTH ? c : c.substring(0, MAX_COMMENT_LENGTH))
                .toList();

        CourseSummaryInput input = new CourseSummaryInput(
                course.getName(), eligible, criteria, positive, neutral, negative, topThemes, comments);
        return Optional.of(new SummaryJob(courseId, eligible, input));
    }

    @Transactional
    public void save(Long courseId, int reviewsCovered, CourseSummaryResult result) {
        CourseSummary summary = summaryRepository.findByCourseId(courseId).orElseGet(() -> {
            CourseSummary created = new CourseSummary();
            created.setCourse(courseRepository.getReferenceById(courseId));
            return created;
        });

        summary.setOverview(result.overview());
        summary.setStrengths(String.join("\n", result.strengths()));
        summary.setImprovements(String.join("\n", result.improvements()));
        summary.setReviewsCovered(reviewsCovered);
        summary.setGeneratedAt(Instant.now());
        summaryRepository.save(summary);
    }
}