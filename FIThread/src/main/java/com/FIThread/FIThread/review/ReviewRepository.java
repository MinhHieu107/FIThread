package com.FIThread.FIThread.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByOfferingId(Long offeringId);

    boolean existsByUserIdAndOfferingId(Long userId, Long offeringId);

    long countByOfferingCourseIdAndStatus(Long courseId, ReviewStatus status);

    Page<Review> findByOfferingCourseIdAndStatusOrderByCreatedAtDesc(
            Long courseId, ReviewStatus status, Pageable pageable);

    List<Review> findByUserIdAndOfferingCourseId(Long userId, Long courseId);

    @Query("""
            select s.criterion.id, s.criterion.name, avg(s.score)
            from ReviewScore s
            where s.review.offering.course.id = :courseId and s.review.status = :status
            group by s.criterion.id, s.criterion.name, s.criterion.sortOrder
            order by s.criterion.sortOrder
            """)
    List<Object[]> averageScoresByCourse(@Param("courseId") Long courseId,
                                         @Param("status") ReviewStatus status);

    List<Review> findByStatusOrderByCreatedAtDesc(ReviewStatus status, Pageable pageable);

    @Query("""
        select r from Review r
        where r.status = :status
          and exists (select 1 from ReviewReport rp where rp.review = r)
        order by r.createdAt desc
        """)
    List<Review> findReportedByStatus(@Param("status") ReviewStatus status, Pageable pageable);
}