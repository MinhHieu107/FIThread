package com.FIThread.FIThread.dashboard;

import com.FIThread.FIThread.common.BaseEntity;
import com.FIThread.FIThread.course.Course;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "course_summaries")
public class CourseSummary extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false, unique = true)
    private Course course;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String overview;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String improvements;

    @Column(name = "reviews_covered", nullable = false)
    private int reviewsCovered;

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;
}