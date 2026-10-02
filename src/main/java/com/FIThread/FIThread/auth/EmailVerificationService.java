package com.FIThread.FIThread.auth;

import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import com.FIThread.FIThread.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final AppProperties appProperties;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public void sendOtp(User user) {
        String otp = generateOtp();

        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setCodeHash(passwordEncoder.encode(otp));
        token.setExpiresAt(Instant.now().plus(appProperties.getOtpExpiryMinutes(), ChronoUnit.MINUTES));
        token.setAttempts(0);
        tokenRepository.save(token);

        mailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
    }

    @Transactional
    public void verify(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.NOT_FOUND));

        if (user.getStatus() != UserStatus.PENDING_EMAIL) {
            throw new BusinessException("Tai khoan da duoc xac thuc truoc do");
        }

        EmailVerificationToken token = tokenRepository
                .findTopByUserAndVerifiedAtIsNullOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new BusinessException("Khong tim thay ma xac thuc, vui long yeu cau gui lai"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException("Ma xac thuc da het han, vui long yeu cau gui lai");
        }

        if (token.getAttempts() >= appProperties.getOtpMaxAttempts()) {
            throw new BusinessException("Ban da nhap sai qua nhieu lan, vui long yeu cau gui lai ma moi");
        }

        if (!passwordEncoder.matches(otp, token.getCodeHash())) {
            token.setAttempts(token.getAttempts() + 1);
            tokenRepository.save(token);
            throw new BusinessException("Ma xac thuc khong dung");
        }

        token.setVerifiedAt(Instant.now());
        tokenRepository.save(token);

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    private String generateOtp() {
        int code = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(code);
    }
}