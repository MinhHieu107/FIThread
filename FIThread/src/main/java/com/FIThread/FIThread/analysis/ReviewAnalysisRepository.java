package com.FIThread.FIThread.analysis;

import com.FIThread.FIThread.review.Review;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ReviewAnalysisRepository extends JpaRepository<ReviewAnalysis, Long> {

    Optional<ReviewAnalysis> findByReviewId(Long reviewId);

    List<ReviewAnalysis> findByStatus(AnalysisStatus status);

    long countByStatus(AnalysisStatus status);

    long countByFlaggedTrue();

    @Query("select a.id from ReviewAnalysis a where a.status = :status and a.nextAttemptAt <= :now order by a.id")
    List<Long> findDueIds(@Param("status") AnalysisStatus status, @Param("now") Instant now, Pageable pageable);

    @Query("select r from Review r where not exists (select 1 from ReviewAnalysis a where a.review = r)")
    List<Review> findReviewsWithoutAnalysis();
}