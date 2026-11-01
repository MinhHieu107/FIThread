package com.FIThread.FIThread.forum;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ForumReportRepository extends JpaRepository<ForumReport, Long> {
    boolean existsByPostIdAndReporterId(Long postId, Long reporterId);

    long countByPostId(Long postId);

    List<ForumReport> findByPostId(Long postId);

    void deleteByPostId(Long postId);

    void deleteByReporterId(Long reporterId);
}