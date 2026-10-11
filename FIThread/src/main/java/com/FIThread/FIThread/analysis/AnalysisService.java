package com.FIThread.FIThread.analysis;

import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.review.Review;
import com.FIThread.FIThread.review.ReviewRepository;
import com.FIThread.FIThread.review.ReviewStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final ReviewAnalysisRepository analysisRepository;
    private final ReviewRepository reviewRepository;
    private final AppProperties appProperties;

    public record Pending(Long analysisId, String comment) {}

    /** Goi tu ReviewService (cung transaction): danh dau danh gia can phan tich lai. */
    @Transactional
    public void requestAnalysis(Review review) {
        ReviewAnalysis analysis = analysisRepository.findByReviewId(review.getId())
                .orElseGet(() -> {
                    ReviewAnalysis created = new ReviewAnalysis();
                    created.setReview(review);
                    return created;
                });
        analysis.reset();
        analysisRepository.save(analysis);
    }

    @Transactional(readOnly = true)
    public List<Long> findDueIds(int limit) {
        return analysisRepository.findDueIds(AnalysisStatus.PENDING, Instant.now(), PageRequest.of(0, limit));
    }

    @Transactional(readOnly = true)
    public Optional<Pending> loadPending(Long analysisId) {
        return analysisRepository.findById(analysisId)
                .filter(a -> a.getStatus() == AnalysisStatus.PENDING)
                .map(a -> new Pending(a.getId(), a.getReview().getComment()));
    }

    @Transactional
    public void saveResult(Long analysisId, String analyzedComment, ReviewAnalysisResult result) {
        ReviewAnalysis analysis = analysisRepository.findById(analysisId).orElse(null);
        if (analysis == null || analysis.getStatus() != AnalysisStatus.PENDING) return;

        Review review = analysis.getReview();
        // Nguoi dung vua sua danh gia trong luc dang phan tich: bo ket qua cu, de lan sau phan tich lai
        if (!review.getComment().equals(analyzedComment)) return;

        analysis.setStatus(AnalysisStatus.DONE);
        analysis.setAttempts(analysis.getAttempts() + 1);
        analysis.setSentiment(result.sentiment());
        analysis.setScore(result.score());
        analysis.setSummary(result.summary());
        analysis.setFlagged(result.flagged());
        analysis.getThemes().clear();
        analysis.getThemes().addAll(result.themes());
        analysis.setErrorMessage(null);
        analysis.setAnalyzedAt(Instant.now());
        analysisRepository.save(analysis);

        if (result.flagged()) autoHide(review);
    }

    /** Gemini tu choi xu ly vi noi dung vi pham: coi nhu bi gan co, khong co cam xuc/diem. */
    @Transactional
    public void saveBlocked(Long analysisId, String analyzedComment) {
        ReviewAnalysis analysis = analysisRepository.findById(analysisId).orElse(null);
        if (analysis == null || analysis.getStatus() != AnalysisStatus.PENDING) return;

        Review review = analysis.getReview();
        if (!review.getComment().equals(analyzedComment)) return;

        analysis.setStatus(AnalysisStatus.DONE);
        analysis.setAttempts(analysis.getAttempts() + 1);
        analysis.setSentiment(null);
        analysis.setScore(null);
        analysis.setSummary("Nội dung bị AI chặn do vi phạm quy tắc an toàn");
        analysis.setFlagged(true);
        analysis.getThemes().clear();
        analysis.setErrorMessage(null);
        analysis.setAnalyzedAt(Instant.now());
        analysisRepository.save(analysis);

        autoHide(review);
    }

    @Transactional
    public void saveFailure(Long analysisId, String message, AiException.Kind kind) {
        ReviewAnalysis analysis = analysisRepository.findById(analysisId).orElse(null);
        if (analysis == null || analysis.getStatus() != AnalysisStatus.PENDING) return;

        analysis.setAttempts(analysis.getAttempts() + 1);
        analysis.setErrorMessage(truncate(message, 500));

        boolean giveUp = kind == AiException.Kind.FATAL
                || analysis.getAttempts() >= appProperties.getAi().getMaxAttempts();
        if (giveUp) {
            analysis.setStatus(AnalysisStatus.FAILED);
        } else {
            long backoffSeconds = Math.min(900L, 30L << Math.min(analysis.getAttempts(), 5));
            analysis.setNextAttemptAt(Instant.now().plus(Duration.ofSeconds(backoffSeconds)));
        }
        analysisRepository.save(analysis);
    }

    /** Bi gioi han toc do: hoan lai, khong tinh la mot lan that bai. */
    @Transactional
    public void defer(Long analysisId, Duration delay) {
        analysisRepository.findById(analysisId).ifPresent(a -> {
            a.setNextAttemptAt(Instant.now().plus(delay));
            a.setErrorMessage("Bi gioi han toc do (429), se thu lai sau");
            analysisRepository.save(a);
        });
    }

    // ---------- cong cu cho admin ----------

    @Transactional(readOnly = true)
    public Map<String, Long> summary() {
        Map<String, Long> result = new LinkedHashMap<>();
        for (AnalysisStatus status : AnalysisStatus.values()) {
            result.put(status.name(), analysisRepository.countByStatus(status));
        }
        result.put("FLAGGED", analysisRepository.countByFlaggedTrue());
        return result;
    }

    @Transactional
    public int requeueFailed() {
        List<ReviewAnalysis> failed = analysisRepository.findByStatus(AnalysisStatus.FAILED);
        failed.forEach(ReviewAnalysis::reset);
        analysisRepository.saveAll(failed);
        return failed.size();
    }

    /** Tao yeu cau phan tich cho cac danh gia cu (tao truoc khi co tinh nang nay). */
    @Transactional
    public int backfillMissing() {
        List<Review> missing = analysisRepository.findReviewsWithoutAnalysis();
        missing.forEach(this::requestAnalysis);
        return missing.size();
    }

    private void autoHide(Review review) {
        if (review.getStatus() == ReviewStatus.PUBLISHED) {
            review.setStatus(ReviewStatus.PENDING_MODERATION);
            reviewRepository.save(review);
        }
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }
}