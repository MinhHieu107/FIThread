package com.FIThread.FIThread.account;

import com.FIThread.FIThread.account.AccountDtos.UserPage;
import com.FIThread.FIThread.account.AccountDtos.UserRow;
import com.FIThread.FIThread.alumni.AlumniProfileRepository;
import com.FIThread.FIThread.alumni.PhotoStorageService;
import com.FIThread.FIThread.auth.EmailVerificationTokenRepository;
import com.FIThread.FIThread.auth.MailService;
import com.FIThread.FIThread.auth.RefreshTokenRepository;
import com.FIThread.FIThread.chat.ChatConversationRepository;
import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.user.Role;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import com.FIThread.FIThread.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import com.FIThread.FIThread.alumni.AlumniProfile;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository verificationRepository;
    private final ChatConversationRepository conversationRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final PhotoStorageService photoStorage;
    private final AccountAuditLogRepository auditRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final AppProperties appProperties;
    private final GraduationRequestRepository graduationRequestRepository;
    private final BackupEmailVerificationRepository backupEmailRepository;
    // ---------- danh sach cho admin ----------

    @Transactional(readOnly = true)
    public UserPage list(String q, String role, String status, int page, int size) {
        String pattern = (q == null || q.isBlank()) ? null : "%" + q.trim().toLowerCase(Locale.ROOT) + "%";

        Page<User> result = userRepository.search(
                pattern,
                parseEnum(Role.class, role),
                parseEnum(UserStatus.class, status),
                UserStatus.DELETED,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Order.desc("createdAt"))));

        List<UserRow> rows = result.getContent().stream()
                .map(u -> {
                    AlumniProfile profile = u.getRole() == Role.ALUMNI
                            ? alumniProfileRepository.findByUserId(u.getId()).orElse(null) : null;
                    return new UserRow(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(),
                            u.getStatus().name(), u.getCohort(), u.getCreatedAt(),
                            profile == null ? null : profile.getBackupEmail(),
                            profile != null && profile.isBackupEmailVerified(),
                            profile != null && profile.isBackupEmailRequired());
                })
                .toList();
        return new UserPage(rows, result.getNumber(), result.getTotalPages(), result.getTotalElements());
    }

    // ---------- hanh dong cua admin ----------

    @Transactional
    public void lock(String adminEmail, Long targetId, String reason) {
        String cleanReason = requireReason(reason);
        User admin = findByEmail(adminEmail);
        User target = findTarget(targetId);

        if (target.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("Chi khoa duoc tai khoan dang hoat dong", HttpStatus.CONFLICT);
        }

        target.setStatus(UserStatus.BANNED);
        userRepository.save(target);
        refreshTokenRepository.deleteByUserId(targetId); // khong cho xin token moi
        audit(admin, target, AccountAction.LOCK, cleanReason);

        mailService.sendPlain(target.getEmail(), "FIThread - Tài khoản bị khóa",
                "Chào " + target.getFullName() + ",\n\nTài khoản FIThread của bạn đã bị khóa.\nLý do: " + cleanReason
                        + "\n\nNếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ "
                        + appProperties.getAlumni().getContactInfo() + ".\n\nFIThread - Khoa CNTT, Đại học Hà Nội");
    }

    @Transactional
    public void unlock(String adminEmail, Long targetId) {
        User admin = findByEmail(adminEmail);
        User target = findTarget(targetId);

        if (target.getStatus() != UserStatus.BANNED) {
            throw new BusinessException("Tai khoan nay khong bi khoa", HttpStatus.CONFLICT);
        }

        target.setStatus(UserStatus.ACTIVE);
        userRepository.save(target);
        audit(admin, target, AccountAction.UNLOCK, null);

        mailService.sendPlain(target.getEmail(), "FIThread - Tài khoản đã được mở khóa",
                "Chào " + target.getFullName() + ",\n\nTài khoản FIThread của bạn đã được mở khóa, "
                        + "bạn có thể đăng nhập lại.\n\nFIThread - Khoa CNTT, Đại học Hà Nội");
    }

    @Transactional
    public void delete(String adminEmail, Long targetId, String reason) {
        String cleanReason = requireReason(reason);
        User admin = findByEmail(adminEmail);
        User target = findTarget(targetId);

        if (target.getStatus() == UserStatus.DELETED) {
            throw new BusinessException("Tai khoan nay da bi xoa", HttpStatus.CONFLICT);
        }

        String originalEmail = target.getEmail();
        String originalName = target.getFullName();
        anonymize(target);
        audit(admin, target, AccountAction.DELETE, cleanReason);

        mailService.sendPlain(originalEmail, "FIThread - Tài khoản đã bị xóa",
                "Chào " + originalName + ",\n\nTài khoản FIThread của bạn đã bị xóa.\nLý do: " + cleanReason
                        + "\n\nNếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ "
                        + appProperties.getAlumni().getContactInfo() + ".\n\nFIThread - Khoa CNTT, Đại học Hà Nội");
    }

    // ---------- chinh chu tu xoa ----------

    @Transactional
    public void selfDelete(String email, String password) {
        User user = findByEmail(email);
        if (user.getRole() == Role.ADMIN) {
            throw new BusinessException("Tai khoan admin khong the tu xoa");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BusinessException("Mat khau xac nhan khong dung");
        }

        anonymize(user);
        audit(user, user, AccountAction.SELF_DELETE, null);
    }

    // ---------- noi bo ----------

    /**
     * Xoa du lieu ca nhan nhung giu lai dong tai khoan (da bi an danh) de cac danh gia mon hoc
     * van tro duoc ve day. Danh gia vo danh nen khong lam lech thong ke.
     */
    private void anonymize(User user) {
        Long id = user.getId();

        refreshTokenRepository.deleteByUserId(id);
        verificationRepository.deleteByUserId(id);
        conversationRepository.deleteByUserId(id);
        graduationRequestRepository.deleteByUserId(id);
        backupEmailRepository.deleteByUserId(id);
        alumniProfileRepository.findByUserId(id).ifPresent(profile -> {
            String photo = profile.getCardPhotoPath();
            alumniProfileRepository.delete(profile);
            if (photo != null) deleteFileAfterCommit(photo);
        });

        user.setEmail("deleted-" + id + "@deleted.invalid");
        user.setFullName("Tài khoản đã xóa");
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setCohort(null);
        user.setStatus(UserStatus.DELETED);
        userRepository.save(user);
    }

    private void deleteFileAfterCommit(String filename) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                photoStorage.delete(filename);
            }
        });
    }

    private void audit(User actor, User target, AccountAction action, String reason) {
        AccountAuditLog log = new AccountAuditLog();
        log.setActor(actor);
        log.setTarget(target);
        log.setAction(action);
        log.setReason(reason);
        auditRepository.save(log);
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.UNAUTHORIZED));
    }

    private User findTarget(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.NOT_FOUND));
        if (user.getRole() == Role.ADMIN) {
            throw new BusinessException("Khong the khoa hoac xoa tai khoan admin");
        }
        return user;
    }

    private static String requireReason(String reason) {
        String clean = reason == null ? "" : reason.trim();
        if (clean.length() < 5) {
            throw new BusinessException("Vui long nhap ly do (it nhat 5 ky tu)");
        }
        return clean;
    }

    private static <E extends Enum<E>> E parseEnum(Class<E> type, String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}