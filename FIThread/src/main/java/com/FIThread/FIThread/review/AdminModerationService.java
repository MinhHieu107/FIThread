package com.FIThread.FIThread.review;

import com.FIThread.FIThread.analysis.AnalysisStatus;
import com.FIThread.FIThread.analysis.ReviewAnalysis;
import com.FIThread.FIThread.analysis.ReviewAnalysisRepository;
import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.course.CourseOffering;
import com.FIThread.FIThread.review.dto.ModerationReviewResponse;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminModerationService {

    private final ReviewRepository reviewRepository;
    private final ReviewReportRepository reportRepository;
    private final ReviewAnalysisRepository analysisRepository;
    private final ModerationLogRepository logRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ModerationReviewResponse> list(String filter) {
        Pageable top = PageRequest.of(0, 100);
        List<Review> reviews = switch (filter) {
            case "REPORTED" -> reviewRepository.findReportedByStatus(ReviewStatus.PUBLISHED, top);
            case "HIDDEN" -> reviewRepository.findByStatusOrderByCreatedAtDesc(ReviewStatus.HIDDEN, top);
            default -> reviewRepository.findByStatusOrderByCreatedAtDesc(ReviewStatus.PENDING_MODERATION, top);
        };
        return reviews.stream().map(this::toResponse).toList();
    }

    /** Admin an danh gia: bat buoc co ly do, ghi nhat ky. */
    @Transactional
    public void hide(String adminEmail, Long id, String reason) {
        String cleanReason = reason == null ? "" : reason.trim();
        if (cleanReason.length() < 5) {
            throw new BusinessException("Vui long nhap ly do an (it nhat 5 ky tu)");
        }

        User admin = findAdmin(adminEmail);
        Review review = find(id);
        if (review.getStatus() == ReviewStatus.HIDDEN) {
            throw new BusinessException("Danh gia nay da bi an", HttpStatus.CONFLICT);
        }

        review.setStatus(ReviewStatus.HIDDEN);
        reviewRepository.save(review);
        logRepository.save(newLog(review, admin, ModerationAction.HIDE, cleanReason));
    }

    /** Hien thi lai va bo qua cac bao cao cu (dem lai tu dau). Ly do khong bat buoc. */
    @Transactional
    public void restore(String adminEmail, Long id, String reason) {
        User admin = findAdmin(adminEmail);
        Review review = find(id);

        review.setStatus(ReviewStatus.PUBLISHED);
        reviewRepository.save(review);
        reportRepository.deleteByReviewId(id);

        String cleanReason = (reason == null || reason.isBlank()) ? null : reason.trim();
        logRepository.save(newLog(review, admin, ModerationAction.RESTORE, cleanReason));
    }

    private ModerationLog newLog(Review review, User admin, ModerationAction action, String reason) {
        ModerationLog log = new ModerationLog();
        log.setReview(review);
        log.setAdmin(admin);
        log.setAction(action);
        log.setReason(reason);
        return log;
    }

    private User findAdmin(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.UNAUTHORIZED));
    }

    private Review find(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay danh gia", HttpStatus.NOT_FOUND));
    }

    private ModerationReviewResponse toResponse(Review r) {
        CourseOffering o = r.getOffering();
        List<ReviewReport> reports = reportRepository.findByReviewId(r.getId());
        List<String> reasons = reports.stream()
                .map(ReviewReport::getReason)
                .filter(reason -> reason != null && !reason.isBlank())
                .toList();

        ReviewAnalysis analysis = analysisRepository.findByReviewId(r.getId()).orElse(null);
        boolean aiFlagged = analysis != null && analysis.isFlagged();
        String aiSummary = (analysis != null && analysis.getStatus() == AnalysisStatus.DONE)
                ? analysis.getSummary() : null;

        List<ModerationReviewResponse.HistoryEntry> history =
                logRepository.findByReviewIdOrderByCreatedAtDesc(r.getId()).stream()
                        .map(l -> new ModerationReviewResponse.HistoryEntry(
                                l.getAction().name(), l.getReason(), l.getAdmin().getFullName(), l.getCreatedAt()))
                        .toList();

        return new ModerationReviewResponse(
                r.getId(),
                o.getCourse().getCode(),
                o.getCourse().getName(),
                o.getLecturer().getFullName(),
                o.getSemester(),
                r.getComment(),
                r.getStatus().name(),
                r.getCreatedAt(),
                reports.size(),
                reasons,
                aiFlagged,
                aiSummary,
                history
        );
    }
}