package com.FIThread.FIThread.account;

import com.FIThread.FIThread.account.AccountDtos.BackupEmailStatus;
import com.FIThread.FIThread.alumni.AlumniProfile;
import com.FIThread.FIThread.alumni.AlumniProfileRepository;
import com.FIThread.FIThread.auth.MailService;
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
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class BackupEmailService {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int RECENT_MINUTES = 30;

    private final BackupEmailVerificationRepository repository;
    private final UserRepository userRepository;
    private final AlumniProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final AppProperties appProperties;

    @Transactional(readOnly = true)
    public BackupEmailStatus status(String accountEmail) {
        User user = findUser(accountEmail);
        if (user.getRole() != Role.ALUMNI) return new BackupEmailStatus(null, false, false);

        return profileRepository.findByUserId(user.getId())
                .map(p -> new BackupEmailStatus(p.getBackupEmail(), p.isBackupEmailVerified(), p.isBackupEmailRequired()))
                .orElse(new BackupEmailStatus(null, false, false));
    }

    @Transactional
    public void start(String accountEmail, String rawEmail) {
        User user = findUser(accountEmail);
        requireEligible(user);

        String email = rawEmail == null ? "" : rawEmail.trim();
        validate(user, email);

        repository.findTopByUserIdOrderByIdDesc(user.getId()).ifPresent(last -> {
            if (last.getCreatedAt() != null && last.getCreatedAt().isAfter(Instant.now().minusSeconds(60))) {
                throw new BusinessException("Vui long doi 60 giay truoc khi gui lai ma", HttpStatus.TOO_MANY_REQUESTS);
            }
        });

        String otp = String.valueOf(100000 + RANDOM.nextInt(900000));

        BackupEmailVerification verification = new BackupEmailVerification();
        verification.setUser(user);
        verification.setEmail(email);
        verification.setCodeHash(passwordEncoder.encode(otp));
        verification.setExpiresAt(Instant.now().plus(appProperties.getOtpExpiryMinutes(), ChronoUnit.MINUTES));
        repository.save(verification);

        mailService.sendOtpEmail(email, user.getFullName(), otp);
    }

    /** Tra ve email da xac thuc. Voi alumni, luu luon vao ho so. */
    @Transactional(noRollbackFor = BusinessException.class)
    public String confirm(String accountEmail, String otp) {
        User user = findUser(accountEmail);
        requireEligible(user);

        BackupEmailVerification v = repository.findTopByUserIdOrderByIdDesc(user.getId())
                .orElseThrow(() -> new BusinessException("Chua gui ma xac thuc, vui long gui ma truoc"));

        if (v.getVerifiedAt() != null) {
            throw new BusinessException("Ma nay da duoc su dung, vui long gui ma moi");
        }
        if (v.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException("Ma xac thuc da het han, vui long gui lai");
        }
        if (v.getAttempts() >= appProperties.getOtpMaxAttempts()) {
            throw new BusinessException("Ban da nhap sai qua nhieu lan, vui long gui ma moi");
        }
        if (otp == null || !passwordEncoder.matches(otp.trim(), v.getCodeHash())) {
            v.setAttempts(v.getAttempts() + 1);
            repository.save(v);
            throw new BusinessException("Ma xac thuc khong dung");
        }

        v.setVerifiedAt(Instant.now());
        repository.save(v);

        if (user.getRole() == Role.ALUMNI) {
            AlumniProfile profile = profileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new BusinessException("Khong tim thay ho so alumni", HttpStatus.NOT_FOUND));
            profile.setBackupEmail(v.getEmail());
            profile.setBackupEmailVerified(true);
            profileRepository.save(profile);
        }
        return v.getEmail();
    }

    /** Email du phong vua duoc xac thuc trong 30 phut gan day, dung khi sinh vien gui yeu cau tot nghiep. */
    @Transactional(readOnly = true)
    public String recentlyVerifiedEmail(Long userId) {
        BackupEmailVerification v = repository.findTopByUserIdOrderByIdDesc(userId).orElse(null);
        if (v == null || v.getVerifiedAt() == null
                || v.getVerifiedAt().isBefore(Instant.now().minus(RECENT_MINUTES, ChronoUnit.MINUTES))) {
            throw new BusinessException("Vui long xac thuc email du phong truoc khi gui yeu cau");
        }
        return v.getEmail();
    }

    // ---------- helpers ----------

    private void validate(User user, String email) {
        if (!EMAIL.matcher(email).matches() || email.length() > 255) {
            throw new BusinessException("Email khong hop le");
        }
        if (email.equalsIgnoreCase(user.getEmail())) {
            throw new BusinessException("Email du phong phai khac email dang nhap cua ban");
        }

        String domain = email.substring(email.indexOf('@') + 1).toLowerCase(Locale.ROOT);
        boolean schoolMail = appProperties.getAllowedEmailDomains().stream()
                .map(d -> d.toLowerCase(Locale.ROOT))
                .anyMatch(d -> domain.equals(d) || domain.endsWith("." + d));
        if (schoolMail) {
            throw new BusinessException("Email du phong phai la email ca nhan, khong dung email cua truong");
        }
    }

    private void requireEligible(User user) {
        boolean okRole = user.getRole() == Role.STUDENT || user.getRole() == Role.ALUMNI;
        if (!okRole || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("Tai khoan khong the dung chuc nang nay", HttpStatus.FORBIDDEN);
        }
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.UNAUTHORIZED));
    }
}