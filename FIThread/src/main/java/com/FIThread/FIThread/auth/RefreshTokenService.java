package com.FIThread.FIThread.auth;

import com.FIThread.FIThread.auth.dto.TokenPairResponse;
import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;
    private final JwtService jwtService;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public String issue(User user) {
        String rawToken = generateRawToken();

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(passwordEncoder.encode(rawToken));
        token.setExpiresAt(Instant.now().plus(appProperties.getRefreshExpirationDays(), ChronoUnit.DAYS));
        refreshTokenRepository.save(token);

        return rawToken;
    }

    /**
     * Doi 1 refresh token hop le lay ca access token lan refresh token moi (rotation).
     * Gop het logic can doc du lieu User vao day, vi transaction se dong khi method ket thuc -
     * khong duoc tra entity User (lazy) ra ngoai roi moi doc field, se bi LazyInitializationException.
     */
    @Transactional
    public TokenPairResponse rotate(String rawToken) {
        RefreshToken matched = findValidToken(rawToken)
                .orElseThrow(() -> new BusinessException("Refresh token khong hop le hoac da het han", HttpStatus.UNAUTHORIZED));

        matched.setRevokedAt(Instant.now());
        refreshTokenRepository.save(matched);

        User user = matched.getUser();
        String newRefreshToken = issue(user);
        String newAccessToken = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return new TokenPairResponse(newAccessToken, newRefreshToken, user.getFullName(), user.getRole().name());
    }

    @Transactional
    public void revoke(String rawToken) {
        findValidToken(rawToken).ifPresent(token -> {
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void revokeAllForUser(User user) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserIdAndRevokedAtIsNull(user.getId());
        Instant now = Instant.now();
        tokens.forEach(t -> t.setRevokedAt(now));
        refreshTokenRepository.saveAll(tokens);
    }

    private java.util.Optional<RefreshToken> findValidToken(String rawToken) {
        return refreshTokenRepository.findAll().stream()
                .filter(t -> t.getRevokedAt() == null)
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
                .filter(t -> passwordEncoder.matches(rawToken, t.getTokenHash()))
                .findFirst();
    }

    private String generateRawToken() {
        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}