package com.FIThread.FIThread.dashboard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseSummaryRepository extends JpaRepository<CourseSummary, Long> {
    Optional<CourseSummary> findByCourseId(Long courseId);
}