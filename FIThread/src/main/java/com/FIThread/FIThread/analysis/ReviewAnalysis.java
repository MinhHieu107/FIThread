package com.FIThread.FIThread.analysis;

import com.FIThread.FIThread.common.BaseEntity;
import com.FIThread.FIThread.review.Review;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "review_analysis")
public class ReviewAnalysis extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "review_id", nullable = false, unique = true)
    private Review review;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnalysisStatus status = AnalysisStatus.PENDING;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(name = "next_attempt_at")
    private Instant nextAttemptAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Sentiment sentiment;

    private Double score;

    @Column(length = 500)
    private String summary;

    @Column(nullable = false)
    private boolean flagged = false;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "analyzed_at")
    private Instant analyzedAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "review_analysis_themes", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "theme", length = 30)
    private List<String> themes = new ArrayList<>();

    /** Dat lai ve PENDING (khi co danh gia moi hoac vua sua noi dung). */
    public void reset() {
        status = AnalysisStatus.PENDING;
        attempts = 0;
        nextAttemptAt = Instant.now();
        sentiment = null;
        score = null;
        summary = null;
        flagged = false;
        errorMessage = null;
        analyzedAt = null;
        themes.clear();
    }
}