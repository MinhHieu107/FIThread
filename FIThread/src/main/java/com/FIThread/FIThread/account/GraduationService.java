package com.FIThread.FIThread.account;

import com.FIThread.FIThread.account.AccountDtos.BatchRow;
import com.FIThread.FIThread.account.AccountDtos.CohortCount;
import com.FIThread.FIThread.account.AccountDtos.GraduationRequestRow;
import com.FIThread.FIThread.account.AccountDtos.GraduationRequestView;
import com.FIThread.FIThread.account.AccountDtos.StudentRow;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class GraduationService {

    private static final int FOUNDING_YEAR = 2006;

    private final UserRepository userRepository;
    private final AlumniProfileRepository profileRepository;
    private final GraduationRequestRepository requestRepository;
    private final GraduationBatchRepository batchRepository;
    private final BackupEmailVerificationRepository backupEmailRepository;
    private final BackupEmailService backupEmailService;
    private final AccountAuditLogRepository auditRepository;
    private final MailService mailService;
    private final AppProperties appProperties;

    public record RevertResult(int reverted, int skipped) {}

    // ---------- sinh vien ----------

    @Transactional(readOnly = true)
    public GraduationRequestView current(String email) {
        User user = findByEmail(email);
        return requestRepository.findTopByUserIdOrderByIdDesc(user.getId()).map(this::toView).orElse(null);
    }

    @Transactional
    public GraduationRequestView submit(String email, Integer year) {
        User user = findByEmail(email);
        if (user.getRole() != Role.STUDENT || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("Chi sinh vien dang hoat dong moi gui duoc yeu cau tot nghiep");
        }
        validateYear(year);
        if (requestRepository.existsByUserIdAndStatus(user.getId(), GraduationStatus.PENDING)) {
            throw new BusinessException("Ban da co yeu cau dang cho duyet", HttpStatus.CONFLICT);
        }

        String backupEmail = backupEmailService.recentlyVerifiedEmail(user.getId());

        GraduationRequest request = new GraduationRequest();
        request.setUser(user);
        request.setGraduationYear(year);
        request.setBackupEmail(backupEmail);
        return toView(requestRepository.save(request));
    }

    // ---------- admin: yeu cau cua sinh vien ----------

    @Transactional(readOnly = true)
    public List<GraduationRequestRow> pendingRequests() {
        return requestRepository.findByStatusOrderByCreatedAtAsc(GraduationStatus.PENDING).stream()
                .map(r -> new GraduationRequestRow(r.getId(), r.getUser().getId(), r.getUser().getFullName(),
                        r.getUser().getEmail(), r.getUser().getCohort(), r.getGraduationYear(),
                        r.getBackupEmail(), r.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void approve(String adminEmail, Long requestId) {
        User admin = findByEmail(adminEmail);
        GraduationRequest request = findPending(requestId);
        User user = request.getUser();

        convert(user, request.getGraduationYear(), request.getBackupEmail(), true, null);

        request.setStatus(GraduationStatus.APPROVED);
        request.setDecidedAt(Instant.now());
        requestRepository.save(request);
        audit(admin, user, AccountAction.GRADUATION_APPROVE, null, null);

        String text = "Chào " + user.getFullName() + ",\n\nYêu cầu tốt nghiệp của bạn đã được duyệt. "
                + "Tài khoản FIThread của bạn giờ là tài khoản cựu sinh viên (tốt nghiệp "
                + request.getGraduationYear() + "). Bạn có thể cập nhật hồ sơ để xuất hiện trong danh bạ alumni.\n\n"
                + "FIThread - Khoa CNTT, Đại học Hà Nội";
        mailService.sendPlain(user.getEmail(), "FIThread - Yêu cầu tốt nghiệp đã được duyệt", text);
        mailService.sendPlain(request.getBackupEmail(), "FIThread - Yêu cầu tốt nghiệp đã được duyệt", text);
    }

    @Transactional
    public void reject(String adminEmail, Long requestId, String reason) {
        String cleanReason = requireReason(reason, "tu choi");

        User admin = findByEmail(adminEmail);
        GraduationRequest request = findPending(requestId);
        User user = request.getUser();

        request.setStatus(GraduationStatus.REJECTED);
        request.setReason(cleanReason);
        request.setDecidedAt(Instant.now());
        requestRepository.save(request);
        audit(admin, user, AccountAction.GRADUATION_REJECT, cleanReason, null);

        String text = "Chào " + user.getFullName() + ",\n\nYêu cầu tốt nghiệp của bạn chưa được duyệt.\nLý do: "
                + cleanReason + "\n\nBạn có thể đăng nhập, vào mục Tài khoản và gửi lại yêu cầu. "
                + "Cần hỗ trợ, vui lòng liên hệ " + appProperties.getAlumni().getContactInfo()
                + ".\n\nFIThread - Khoa CNTT, Đại học Hà Nội";
        mailService.sendPlain(user.getEmail(), "FIThread - Yêu cầu tốt nghiệp chưa được duyệt", text);
        mailService.sendPlain(request.getBackupEmail(), "FIThread - Yêu cầu tốt nghiệp chưa được duyệt", text);
    }

    // ---------- admin: chuyen truc tiep ----------

    @Transactional
    public void graduateOne(String adminEmail, Long userId, Integer year) {
        validateYear(year);
        User admin = findByEmail(adminEmail);
        User user = findUser(userId);

        convert(user, year, null, false, null);
        audit(admin, user, AccountAction.GRADUATE, "Tot nghiep " + year, null);
        sendConvertedNotice(user);
    }

    @Transactional(readOnly = true)
    public List<CohortCount> cohorts() {
        return userRepository.countStudentsByCohort(Role.STUDENT, UserStatus.ACTIVE).stream()
                .map(r -> new CohortCount((String) r[0], ((Number) r[1]).longValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentRow> cohortStudents(String cohort) {
        String clean = cohort == null ? "" : cohort.trim();
        return userRepository.findByRoleAndStatusAndCohortIgnoreCase(Role.STUDENT, UserStatus.ACTIVE, clean).stream()
                .sorted(Comparator.comparing(User::getFullName, String.CASE_INSENSITIVE_ORDER))
                .map(u -> new StudentRow(u.getId(), u.getFullName(), u.getEmail()))
                .toList();
    }

    /** Chuyen nhung sinh vien duoc chon trong mot khoa; tao mot "dot" de co the hoan tac ca dot. */
    @Transactional
    public int graduateSelected(String adminEmail, String cohort, Integer year, List<Long> userIds) {
        validateYear(year);
        User admin = findByEmail(adminEmail);

        String cleanCohort = cohort == null ? "" : cohort.trim();
        if (cleanCohort.isEmpty()) {
            throw new BusinessException("Vui long chon khoa");
        }

        Set<Long> wanted = new LinkedHashSet<>(userIds);
        List<User> students = userRepository
                .findByRoleAndStatusAndCohortIgnoreCase(Role.STUDENT, UserStatus.ACTIVE, cleanCohort).stream()
                .filter(u -> wanted.contains(u.getId()))
                .toList();
        if (students.size() != wanted.size()) {
            throw new BusinessException(
                    "Danh sach chon co nguoi khong thuoc khoa nay hoac khong con la sinh vien dang hoat dong, vui long tai lai trang",
                    HttpStatus.CONFLICT);
        }

        GraduationBatch batch = new GraduationBatch();
        batch.setCohort(cleanCohort);
        batch.setGraduationYear(year);
        batch.setStudentCount(students.size());
        batch.setCreatedBy(admin);
        batch = batchRepository.save(batch);

        for (User user : students) {
            convert(user, year, null, false, batch.getId());
            audit(admin, user, AccountAction.GRADUATE,
                    "Tot nghiep " + year + " (dot chuyen #" + batch.getId() + ", khoa " + cleanCohort + ")",
                    batch.getId());
            sendConvertedNotice(user);
        }
        return students.size();
    }

    // ---------- admin: dot chuyen va chuyen lai ----------

    @Transactional(readOnly = true)
    public List<BatchRow> batches() {
        return batchRepository.findTop20ByOrderByIdDesc().stream()
                .map(b -> {
                    List<AlumniProfile> members = profileRepository.findByGraduationBatchId(b.getId());
                    int filled = (int) members.stream().filter(this::hasFilledInfo).count();
                    return new BatchRow(b.getId(), b.getCohort(), b.getGraduationYear(), b.getStudentCount(),
                            members.size(), filled, b.getCreatedAt(), b.getCreatedBy().getFullName(),
                            b.getRevertedAt() != null, b.getRevertedAt());
                })
                .toList();
    }

    @Transactional
    public void revertOne(String adminEmail, Long userId, String reason) {
        String cleanReason = requireReason(reason, "chuyen lai");
        User admin = findByEmail(adminEmail);
        revertUser(findUser(userId), admin, cleanReason, null);
    }

    /** Hoan tac ca dot: chi tac dong nhung nguoi cua dot con la cuu sinh vien dang hoat dong. */
    @Transactional
    public RevertResult revertBatch(String adminEmail, Long batchId, String reason) {
        String cleanReason = requireReason(reason, "hoan tac");
        User admin = findByEmail(adminEmail);

        GraduationBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new BusinessException("Khong tim thay dot chuyen", HttpStatus.NOT_FOUND));
        if (batch.getRevertedAt() != null) {
            throw new BusinessException("Dot chuyen nay da duoc hoan tac", HttpStatus.CONFLICT);
        }

        int reverted = 0;
        int skipped = 0;
        for (AlumniProfile profile : profileRepository.findByGraduationBatchId(batchId)) {
            User user = profile.getUser();
            if (user.getRole() == Role.ALUMNI && user.getStatus() == UserStatus.ACTIVE) {
                revertUser(user, admin, cleanReason, batchId);
                reverted++;
            } else {
                skipped++;
            }
        }

        batch.setRevertedAt(Instant.now());
        batch.setRevertedBy(admin);
        batchRepository.save(batch);
        return new RevertResult(reverted, skipped);
    }

    // ---------- noi bo ----------

    /** Doi vai tro STUDENT -> ALUMNI va tao ho so alumni. Giu nguyen tai khoan, danh gia va lich su. */
    private void convert(User user, int year, String backupEmail, boolean backupVerified, Long batchId) {
        if (user.getRole() != Role.STUDENT || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("Chi chuyen duoc sinh vien dang hoat dong", HttpStatus.CONFLICT);
        }

        user.setRole(Role.ALUMNI);
        userRepository.save(user);

        AlumniProfile profile = profileRepository.findByUserId(user.getId()).orElseGet(AlumniProfile::new);
        profile.setUser(user);
        profile.setGraduationYear(year);
        profile.setBackupEmailRequired(true);
        profile.setGraduationBatchId(batchId);
        if (backupVerified && backupEmail != null) {
            profile.setBackupEmail(backupEmail);
            profile.setBackupEmailVerified(true);
        } else {
            profile.setBackupEmailVerified(false);
        }
        profileRepository.save(profile);
    }

    /** Alumni -> sinh vien: xoa ho so (ke ca thong tin da dien), email du phong va yeu cau tot nghiep cua nguoi do. */
    private void revertUser(User user, User admin, String reason, Long batchId) {
        if (user.getRole() != Role.ALUMNI || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("Chi chuyen lai duoc cuu sinh vien dang hoat dong", HttpStatus.CONFLICT);
        }

        AlumniProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Khong tim thay ho so alumni", HttpStatus.NOT_FOUND));
        if (!profile.isBackupEmailRequired()) {
            throw new BusinessException(
                    "Tai khoan alumni nay khong duoc chuyen tu sinh vien nen khong the chuyen lai");
        }

        profileRepository.delete(profile);
        backupEmailRepository.deleteByUserId(user.getId());
        requestRepository.deleteByUserId(user.getId());

        user.setRole(Role.STUDENT);
        userRepository.save(user);
        audit(admin, user, AccountAction.REVERT_GRADUATE, reason, batchId);

        mailService.sendPlain(user.getEmail(), "FIThread - Tài khoản đã được khôi phục thành sinh viên",
                "Chào " + user.getFullName() + ",\n\nQuản trị viên đã khôi phục tài khoản FIThread của bạn về "
                        + "trạng thái sinh viên (email thông báo chuyển thành cựu sinh viên trước đó là do nhầm lẫn "
                        + "hoặc chưa đúng thời điểm).\nLý do: " + reason + "\n\nHồ sơ cựu sinh viên đã được xóa. "
                        + "Khi tốt nghiệp, bạn có thể gửi yêu cầu ở mục Tài khoản.\n\n"
                        + "FIThread - Khoa CNTT, Đại học Hà Nội");
    }

    private boolean hasFilledInfo(AlumniProfile p) {
        return notBlank(p.getCompany()) || notBlank(p.getPositionTitle()) || notBlank(p.getIndustry())
                || notBlank(p.getBio()) || notBlank(p.getLinkedinUrl()) || p.isBackupEmailVerified();
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private void sendConvertedNotice(User user) {
        mailService.sendPlain(user.getEmail(), "FIThread - Tài khoản đã được chuyển thành cựu sinh viên",
                "Chào " + user.getFullName() + ",\n\nTài khoản FIThread của bạn đã được chuyển thành tài khoản "
                        + "cựu sinh viên.\n\nĐể xuất hiện trong danh bạ alumni và giữ liên lạc với khoa khi email "
                        + "trường không còn dùng được, vui lòng đăng nhập, vào mục Tài khoản và bổ sung email cá nhân "
                        + "dự phòng (xác thực bằng mã OTP). Email này chỉ quản trị viên nhìn thấy, không hiển thị "
                        + "công khai.\n\nFIThread - Khoa CNTT, Đại học Hà Nội");
    }

    private GraduationRequest findPending(Long id) {
        GraduationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay yeu cau", HttpStatus.NOT_FOUND));
        if (request.getStatus() != GraduationStatus.PENDING) {
            throw new BusinessException("Yeu cau nay da duoc xu ly", HttpStatus.CONFLICT);
        }
        return request;
    }

    private void validateYear(Integer year) {
        int currentYear = LocalDate.now().getYear();
        if (year == null || year < FOUNDING_YEAR || year > currentYear) {
            throw new BusinessException("Nam tot nghiep phai tu " + FOUNDING_YEAR + " den " + currentYear);
        }
    }

    private static String requireReason(String reason, String action) {
        String clean = reason == null ? "" : reason.trim();
        if (clean.length() < 5) {
            throw new BusinessException("Vui long nhap ly do " + action + " (it nhat 5 ky tu)");
        }
        return clean;
    }

    private void audit(User actor, User target, AccountAction action, String reason, Long batchId) {
        AccountAuditLog log = new AccountAuditLog();
        log.setActor(actor);
        log.setTarget(target);
        log.setAction(action);
        log.setReason(reason);
        log.setBatchId(batchId);
        auditRepository.save(log);
    }

    private GraduationRequestView toView(GraduationRequest r) {
        return new GraduationRequestView(r.getId(), r.getGraduationYear(), r.getStatus().name(),
                r.getReason(), r.getCreatedAt());
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.NOT_FOUND));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.UNAUTHORIZED));
    }
}