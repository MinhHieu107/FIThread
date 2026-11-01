package com.FIThread.FIThread.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findTopByUserIdOrderByIdDesc(Long userId);

    void deleteByUserId(Long userId);
}