package com.FIThread.FIThread.dashboard;

import com.FIThread.FIThread.analysis.AnalysisStatus;
import com.FIThread.FIThread.analysis.ReviewAnalysis;
import com.FIThread.FIThread.review.ReviewStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DashboardStatsRepository extends Repository<ReviewAnalysis, Long> {

    /** [courseId, sentiment, score, analyzedAt] cua cac danh gia da phan tich va dang hien thi. */
    @Query("""
            select a.review.offering.course.id, a.sentiment, a.score, a.analyzedAt
            from ReviewAnalysis a
            where a.status = :done and a.sentiment is not null and a.review.status = :published
            """)
    List<Object[]> analysisRows(@Param("done") AnalysisStatus done, @Param("published") ReviewStatus published);

    /** [courseId, theme, sentiment] */
    @Query("""
            select a.review.offering.course.id, t, a.sentiment
            from ReviewAnalysis a join a.themes t
            where a.status = :done and a.sentiment is not null and a.review.status = :published
            """)
    List<Object[]> themeRows(@Param("done") AnalysisStatus done, @Param("published") ReviewStatus published);

    /** [courseId, soDanhGia, diemTrungBinhRubric] */
    @Query("""
            select s.review.offering.course.id, count(distinct s.review.id), avg(s.score)
            from ReviewScore s
            where s.review.status = :published
            group by s.review.offering.course.id
            """)
    List<Object[]> ratingByCourse(@Param("published") ReviewStatus published);
}