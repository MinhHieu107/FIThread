package com.FIThread.FIThread.review;

import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReviewRepository reviewRepository;
    private final ReviewReportRepository reportRepository;
    private final UserRepository userRepository;
    private final AppProperties appProperties;

    @Transactional
    public void report(String email, Long reviewId, String reason) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.UNAUTHORIZED));
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessException("Khong tim thay danh gia", HttpStatus.NOT_FOUND));

        if (review.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Ban khong the bao cao danh gia cua chinh minh");
        }
        if (review.getStatus() != ReviewStatus.PUBLISHED) {
            throw new BusinessException("Danh gia nay khong con hien thi", HttpStatus.NOT_FOUND);
        }
        if (reportRepository.existsByReviewIdAndReporterId(reviewId, user.getId())) {
            throw new BusinessException("Ban da bao cao danh gia nay roi", HttpStatus.CONFLICT);
        }

        ReviewReport report = new ReviewReport();
        report.setReview(review);
        report.setReporter(user);
        report.setReason(reason == null || reason.isBlank() ? null : reason.trim());
        try {
            reportRepository.saveAndFlush(report);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException("Ban da bao cao danh gia nay roi", HttpStatus.CONFLICT);
        }

        if (reportRepository.countByReviewId(reviewId) >= appProperties.getReportsToAutoHide()) {
            review.setStatus(ReviewStatus.PENDING_MODERATION);
            reviewRepository.save(review);
        }
    }
}