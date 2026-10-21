package com.FIThread.FIThread.account;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BackupEmailVerificationRepository extends JpaRepository<BackupEmailVerification, Long> {
    Optional<BackupEmailVerification> findTopByUserIdOrderByIdDesc(Long userId);

    void deleteByUserId(Long userId);
}