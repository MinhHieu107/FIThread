package com.FIThread.FIThread.account;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GraduationRequestRepository extends JpaRepository<GraduationRequest, Long> {
    Optional<GraduationRequest> findTopByUserIdOrderByIdDesc(Long userId);

    boolean existsByUserIdAndStatus(Long userId, GraduationStatus status);

    List<GraduationRequest> findByStatusOrderByCreatedAtAsc(GraduationStatus status);

    void deleteByUserId(Long userId);
}