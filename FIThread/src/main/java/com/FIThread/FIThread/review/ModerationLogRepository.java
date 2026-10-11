package com.FIThread.FIThread.review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModerationLogRepository extends JpaRepository<ModerationLog, Long> {
    List<ModerationLog> findByReviewIdOrderByCreatedAtDesc(Long reviewId);
}