package com.FIThread.FIThread.account;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GraduationBatchRepository extends JpaRepository<GraduationBatch, Long> {
    List<GraduationBatch> findTop20ByOrderByIdDesc();
}