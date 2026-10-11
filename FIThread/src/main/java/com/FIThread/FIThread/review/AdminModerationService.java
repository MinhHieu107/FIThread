package com.FIThread.FIThread.review;

import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.course.CourseOffering;
import com.FIThread.FIThread.review.dto.ModerationReviewResponse;
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

    @Transactional
    public void hide(Long id) {
        Review review = find(id);
        review.setStatus(ReviewStatus.HIDDEN);
        reviewRepository.save(review);
    }

    /** Hien thi lai va bo qua cac bao cao cu (dem lai tu dau). */
    @Transactional
    public void restore(Long id) {
        Review review = find(id);
        review.setStatus(ReviewStatus.PUBLISHED);
        reviewRepository.save(review);
        reportRepository.deleteByReviewId(id);
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
                reasons
        );
    }
}