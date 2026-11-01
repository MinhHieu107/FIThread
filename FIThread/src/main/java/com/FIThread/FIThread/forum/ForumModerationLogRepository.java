package com.FIThread.FIThread.forum;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ForumModerationLogRepository extends JpaRepository<ForumModerationLog, Long> {
    List<ForumModerationLog> findByPostIdOrderByCreatedAtDesc(Long postId);
}