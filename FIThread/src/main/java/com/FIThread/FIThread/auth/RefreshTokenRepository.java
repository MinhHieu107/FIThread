package com.FIThread.FIThread.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    List<RefreshToken> findByUserIdAndRevokedAtIsNull(Long userId);
}