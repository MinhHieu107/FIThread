package com.FIThread.FIThread.review;

import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.course.*;
import com.FIThread.FIThread.review.dto.*;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CourseOfferingRepository offeringRepository;
    private final CourseRepository courseRepository;
    private final RubricCriterionRepository rubricRepository;
    private final UserRepository userRepository;
    private final AppProperties appProperties;

    @Transactional
    public ReviewResponse create(String email, Long offeringId, ReviewRequest request) {
        User user = findUser(email);
        CourseOffering offering = offeringRepository.findById(offeringId)
                .orElseThrow(() -> new BusinessException("Khong tim thay lan mo lop", HttpStatus.NOT_FOUND));

        if (reviewRepository.existsByUserIdAndOfferingId(user.getId(), offeringId)) {
            throw new BusinessException("Ban da danh gia lan mo lop nay, hay sua danh gia cu", HttpStatus.CONFLICT);
        }

        Map<Long, RubricCriterion> criteria = loadCriteria();
        validateScores(request, criteria);

        Review review = new Review();
        review.setUser(user);
        review.setOffering(offering);
        review.setComment(request.getComment().trim());
        for (ReviewRequest.ScoreInput input : request.getScores()) {
            ReviewScore score = new ReviewScore();
            score.setReview(review);
            score.setCriterion(criteria.get(input.getCriterionId()));
            score.setScore(input.getScore());
            review.getScores().add(score);
        }

        try {
            reviewRepository.saveAndFlush(review);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException("Ban da danh gia lan mo lop nay, hay sua danh gia cu", HttpStatus.CONFLICT);
        }
        return toResponse(review, user.getId());
    }

    @Transactional
    public ReviewResponse update(String email, Long reviewId, ReviewRequest request) {
        User user = findUser(email);
        Review review = findOwnedReview(user, reviewId);

        Map<Long, RubricCriterion> criteria = loadCriteria();
        validateScores(request, criteria);

        review.setComment(request.getComment().trim());

        // Cap nhat diem tai cho (khong xoa roi tao lai) de khong vuong rang buoc unique (review_id, criterion_id)
        Map<Long, ReviewScore> existing = review.getScores().stream()
                .collect(Collectors.toMap(s -> s.getCriterion().getId(), s -> s));
        for (ReviewRequest.ScoreInput input : request.getScores()) {
            ReviewScore score = existing.get(input.getCriterionId());
            if (score == null) {
                score = new ReviewScore();
                score.setReview(review);
                score.setCriterion(criteria.get(input.getCriterionId()));
                review.getScores().add(score);
            }
            score.setScore(input.getScore());
        }

        reviewRepository.save(review);
        return toResponse(review, user.getId());
    }

    @Transactional
    public void delete(String email, Long reviewId) {
        User user = findUser(email);
        reviewRepository.delete(findOwnedReview(user, reviewId));
    }

    @Transactional(readOnly = true)
    public ReviewPageResponse listByCourse(String email, Long courseId, int page, int size) {
        ensureCourseExists(courseId);
        User user = findUser(email);

        Page<Review> result = reviewRepository.findByOfferingCourseIdAndStatusOrderByCreatedAtDesc(
                courseId, ReviewStatus.PUBLISHED,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50)));

        List<ReviewResponse> content = result.getContent().stream()
                .map(r -> toResponse(r, user.getId()))
                .toList();
        return new ReviewPageResponse(content, result.getNumber(), result.getTotalPages(), result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> myReviews(String email, Long courseId) {
        ensureCourseExists(courseId);
        User user = findUser(email);
        return reviewRepository.findByUserIdAndOfferingCourseId(user.getId(), courseId).stream()
                .map(r -> toResponse(r, user.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseStatsResponse stats(Long courseId) {
        ensureCourseExists(courseId);
        long count = reviewRepository.countByOfferingCourseIdAndStatus(courseId, ReviewStatus.PUBLISHED);
        int min = appProperties.getMinReviewsForStats();

        if (count < min) {
            return new CourseStatsResponse(count, min, true, null, List.of());
        }

        List<Object[]> rows = reviewRepository.averageScoresByCourse(courseId, ReviewStatus.PUBLISHED);
        List<CourseStatsResponse.CriterionStat> criteria = rows.stream()
                .map(r -> new CourseStatsResponse.CriterionStat((Long) r[0], (String) r[1], round1((Double) r[2])))
                .toList();
        double overall = rows.stream().mapToDouble(r -> (Double) r[2]).average().orElse(0);

        return new CourseStatsResponse(count, min, false, round1(overall), criteria);
    }

    // ---------- helpers ----------

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.UNAUTHORIZED));
    }

    private void ensureCourseExists(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new BusinessException("Khong tim thay mon hoc", HttpStatus.NOT_FOUND);
        }
    }

    private Review findOwnedReview(User user, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessException("Khong tim thay danh gia", HttpStatus.NOT_FOUND));
        if (!review.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Ban khong co quyen thao tac danh gia nay", HttpStatus.FORBIDDEN);
        }
        return review;
    }

    private Map<Long, RubricCriterion> loadCriteria() {
        return rubricRepository.findAll().stream()
                .collect(Collectors.toMap(RubricCriterion::getId, c -> c));
    }

    private void validateScores(ReviewRequest request, Map<Long, RubricCriterion> criteria) {
        Set<Long> seen = new HashSet<>();
        for (ReviewRequest.ScoreInput input : request.getScores()) {
            if (!criteria.containsKey(input.getCriterionId())) {
                throw new BusinessException("Tieu chi khong hop le");
            }
            if (!seen.add(input.getCriterionId())) {
                throw new BusinessException("Tieu chi bi trung lap");
            }
        }
        if (seen.size() != criteria.size()) {
            throw new BusinessException("Vui long cham diem day du tat ca cac tieu chi");
        }
    }

    private ReviewResponse toResponse(Review r, Long viewerId) {
        List<ReviewResponse.ScoreView> scores = r.getScores().stream()
                .sorted(Comparator.comparingInt((ReviewScore s) -> s.getCriterion().getSortOrder()))
                .map(s -> new ReviewResponse.ScoreView(
                        s.getCriterion().getId(), s.getCriterion().getName(), s.getScore()))
                .toList();
        double avg = r.getScores().stream().mapToInt(ReviewScore::getScore).average().orElse(0);
        CourseOffering o = r.getOffering();

        return new ReviewResponse(
                r.getId(),
                o.getId(),
                o.getLecturer().getFullName(),
                o.getSemester(),
                r.getComment(),
                r.getCreatedAt(),
                scores,
                round1(avg),
                r.getUser().getId().equals(viewerId)
        );
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}