package com.FIThread.FIThread.review;

import com.FIThread.FIThread.review.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReportService reportService;
    @PostMapping("/api/reviews/{id}/report")
    public Map<String, String> report(@PathVariable Long id,
                                      @Valid @RequestBody ReportRequest request,
                                      Authentication auth) {
        reportService.report(auth.getName(), id, request.getReason());
        return Map.of("message", "Da gui bao cao");
    }
    @PostMapping("/api/offerings/{offeringId}/reviews")
    public ReviewResponse create(@PathVariable Long offeringId,
                                 @Valid @RequestBody ReviewRequest request,
                                 Authentication auth) {
        return reviewService.create(auth.getName(), offeringId, request);
    }

    @PutMapping("/api/reviews/{id}")
    public ReviewResponse update(@PathVariable Long id,
                                 @Valid @RequestBody ReviewRequest request,
                                 Authentication auth) {
        return reviewService.update(auth.getName(), id, request);
    }

    @DeleteMapping("/api/reviews/{id}")
    public Map<String, String> delete(@PathVariable Long id, Authentication auth) {
        reviewService.delete(auth.getName(), id);
        return Map.of("message", "Da xoa danh gia");
    }

    @GetMapping("/api/courses/{courseId}/reviews")
    public ReviewPageResponse list(@PathVariable Long courseId,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "10") int size,
                                   Authentication auth) {
        return reviewService.listByCourse(auth.getName(), courseId, page, size);
    }

    @GetMapping("/api/courses/{courseId}/my-reviews")
    public List<ReviewResponse> myReviews(@PathVariable Long courseId, Authentication auth) {
        return reviewService.myReviews(auth.getName(), courseId);
    }

    @GetMapping("/api/courses/{courseId}/stats")
    public CourseStatsResponse stats(@PathVariable Long courseId) {
        return reviewService.stats(courseId);
    }
}