package com.FIThread.FIThread.auth;

import com.FIThread.FIThread.alumni.AlumniProfileRepository;
import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.user.Role;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import com.FIThread.FIThread.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    public static final String SENT_MESSAGE =
            "Neu email ton tai trong he thong, ma dat lai mat khau da duoc gui. Ma co hieu luc 15 phut.";
    private static final String BAD_CODE =
            "Ma xac thuc khong dung hoac da het han. Neu ban nhap sai nhieu lan, hay yeu cau ma moi.";
    private static final int GLOBAL_LIMIT_PER_10_MIN = 30;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final AlumniProfileRepository profileRepository;
    private final PasswordResetRepository resetRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final AppProperties appProperties;

    private final Map<String, Instant> lastRequestByEmail = new HashMap<>();
    private final Deque<Instant> recentRequests = new ArrayDeque<>();

    /**
     * Luon tra loi giong nhau du email co ton tai hay khong, de nguoi la khong do duoc tai khoan.
     * Ma gui toi email tai khoan va them email du phong da xac thuc (neu co).
     */
    @Transactional
    public String requestReset(String rawEmail) {
        String email = normalize(rawEmail);
        checkRate(email);

        // Luon ma hoa mot ma de thoi gian xu ly khong lo viec email co ton tai hay khong
        String otp = String.valueOf(100000 + RANDOM.nextInt(900000));
        String hash = passwordEncoder.encode(otp);

        userRepository.findByEmail(email)
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .ifPresent(user -> issueAndSend(user, otp, hash));

        return SENT_MESSAGE;
    }

    @Transactional(noRollbackFor = BusinessException.class)
    public void resetPassword(String rawEmail, String otp, String newPassword) {
        if (newPassword == null || newPassword.length() < 8 || newPassword.length() > 72) {
            throw new BusinessException("Mat khau moi phai tu 8 den 72 ky tu");
        }

        User user = userRepository.findByEmail(normalize(rawEmail))
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .orElse(null);
        PasswordReset reset = user == null ? null
                : resetRepository.findTopByUserIdOrderByIdDesc(user.getId()).orElse(null);

        boolean usable = reset != null
                && reset.getUsedAt() == null
                && reset.getExpiresAt().isAfter(Instant.now())
                && reset.getAttempts() < appProperties.getOtpMaxAttempts();
        if (!usable) {
            throw new BusinessException(BAD_CODE);
        }

        if (otp == null || !passwordEncoder.matches(otp.trim(), reset.getCodeHash())) {
            reset.setAttempts(reset.getAttempts() + 1);
            resetRepository.save(reset); // noRollbackFor: so lan nhap sai duoc luu that
            throw new BusinessException(BAD_CODE);
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        reset.setUsedAt(Instant.now());
        resetRepository.save(reset);

        // Dang xuat moi thiet bi: khong con refresh token de xin phien moi
        refreshTokenRepository.deleteByUserId(user.getId());

        mailService.sendPlain(user.getEmail(), "FIThread - Mật khẩu đã được đổi",
                "Chào " + user.getFullName() + ",\n\nMật khẩu tài khoản FIThread của bạn vừa được đặt lại. "
                        + "Nếu không phải bạn thực hiện, hãy liên hệ " + appProperties.getAlumni().getContactInfo()
                        + " ngay.\n\nFIThread - Khoa CNTT, Đại học Hà Nội");
    }

    // ---------- noi bo ----------

    private void issueAndSend(User user, String otp, String hash) {
        PasswordReset reset = new PasswordReset();
        reset.setUser(user);
        reset.setCodeHash(hash);
        reset.setExpiresAt(Instant.now().plus(appProperties.getOtpExpiryMinutes(), ChronoUnit.MINUTES));
        resetRepository.save(reset);

        int minutes = appProperties.getOtpExpiryMinutes();
        mailService.sendResetEmail(user.getEmail(), user.getFullName(), otp, minutes);

        if (user.getRole() == Role.ALUMNI) {
            profileRepository.findByUserId(user.getId())
                    .filter(p -> p.isBackupEmailVerified() && p.getBackupEmail() != null)
                    .ifPresent(p -> mailService.sendResetEmail(p.getBackupEmail(), user.getFullName(), otp, minutes));
        }
    }

    private synchronized void checkRate(String email) {
        Instant now = Instant.now();
        recentRequests.removeIf(t -> t.isBefore(now.minus(Duration.ofMinutes(10))));
        if (lastRequestByEmail.size() > 1000) {
            lastRequestByEmail.values().removeIf(t -> t.isBefore(now.minusSeconds(60)));
        }

        Instant last = lastRequestByEmail.get(email);
        if (last != null && last.isAfter(now.minusSeconds(60))) {
            throw new BusinessException("Vui long doi 60 giay truoc khi yeu cau ma moi", HttpStatus.TOO_MANY_REQUESTS);
        }
        if (recentRequests.size() >= GLOBAL_LIMIT_PER_10_MIN) {
            throw new BusinessException(
                    "He thong dang nhan qua nhieu yeu cau, vui long thu lai sau it phut", HttpStatus.TOO_MANY_REQUESTS);
        }

        lastRequestByEmail.put(email, now);
        recentRequests.addLast(now);
    }

    private static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}