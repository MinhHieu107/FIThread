package com.FIThread.FIThread.alumni;

import com.FIThread.FIThread.alumni.AlumniDtos.ApplicationResponse;
import com.FIThread.FIThread.auth.EmailVerificationService;
import com.FIThread.FIThread.auth.MailService;
import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.user.Role;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import com.FIThread.FIThread.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AlumniService {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final int FOUNDING_YEAR = 2006;

    private final UserRepository userRepository;
    private final AlumniProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final PhotoStorageService photoStorage;
    private final MailService mailService;
    private final AppProperties appProperties;

    public record PhotoFile(Resource resource, MediaType mediaType) {}

    @Transactional
    public void register(String email, String fullName, String password, String cohort,
                         Integer graduationYear, boolean consent, MultipartFile photo) {
        String cleanEmail = email == null ? "" : email.trim();
        String cleanName = fullName == null ? "" : fullName.trim();
        String cleanCohort = cohort == null ? "" : cohort.trim();
        int currentYear = LocalDate.now().getYear();

        if (!EMAIL.matcher(cleanEmail).matches() || cleanEmail.length() > 255) {
            throw new BusinessException("Email khong hop le");
        }
        if (cleanName.length() < 2 || cleanName.length() > 255) {
            throw new BusinessException("Ho ten phai tu 2 den 255 ky tu");
        }
        if (password == null || password.length() < 8 || password.length() > 72) {
            throw new BusinessException("Mat khau phai tu 8 den 72 ky tu");
        }
        if (cleanCohort.isEmpty() || cleanCohort.length() > 20) {
            throw new BusinessException("Vui long nhap khoa (toi da 20 ky tu)");
        }
        if (graduationYear == null || graduationYear < FOUNDING_YEAR || graduationYear > currentYear) {
            throw new BusinessException("Nam tot nghiep phai tu " + FOUNDING_YEAR + " den " + currentYear);
        }
        if (!consent) {
            throw new BusinessException("Vui long dong y hien thi ho so cho nguoi dung trong he thong");
        }
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BusinessException("Email nay da duoc dang ky", HttpStatus.CONFLICT);
        }

        String filename = photoStorage.store(photo);
        try {
            User user = new User();
            user.setEmail(cleanEmail);
            user.setFullName(cleanName);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setCohort(cleanCohort);
            user.setRole(Role.ALUMNI);
            user.setStatus(UserStatus.PENDING_EMAIL);
            user = userRepository.saveAndFlush(user);

            AlumniProfile profile = new AlumniProfile();
            profile.setUser(user);
            profile.setGraduationYear(graduationYear);
            profile.setCardPhotoPath(filename);
            profileRepository.saveAndFlush(profile);

            emailVerificationService.sendOtp(user);
        } catch (RuntimeException e) {
            photoStorage.delete(filename);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> applications(String status) {
        UserStatus s = "REJECTED".equals(status) ? UserStatus.REJECTED : UserStatus.PENDING_APPROVAL;
        return profileRepository.findByUserStatusOrderByCreatedAtAsc(s).stream()
                .map(p -> new ApplicationResponse(
                        p.getUser().getId(), p.getUser().getFullName(), p.getUser().getEmail(),
                        p.getUser().getCohort(), p.getGraduationYear(), p.getCreatedAt(),
                        p.getCardPhotoPath() != null))
                .toList();
    }

    @Transactional(readOnly = true)
    public PhotoFile photo(Long userId) {
        AlumniProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Khong tim thay ho so", HttpStatus.NOT_FOUND));
        String path = profile.getCardPhotoPath();
        if (path == null) {
            throw new BusinessException("Anh the da duoc xoa sau khi xu ly", HttpStatus.NOT_FOUND);
        }
        return new PhotoFile(photoStorage.load(path), photoStorage.mediaType(path));
    }

    /** Duyet ho so (ca ho so dang cho duyet lan ho so da bi tu choi nhung co minh chung bo sung). */
    @Transactional
    public void approve(Long userId) {
        User user = findAlumniUser(userId);
        if (user.getStatus() != UserStatus.PENDING_APPROVAL && user.getStatus() != UserStatus.REJECTED) {
            throw new BusinessException("Ho so khong o trang thai cho duyet hoac bi tu choi", HttpStatus.CONFLICT);
        }

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        discardPhoto(userId);

        mailService.sendPlain(user.getEmail(), "FIThread - Hồ sơ alumni đã được duyệt",
                "Chào " + user.getFullName() + ",\n\n"
                        + "Hồ sơ cựu sinh viên của bạn đã được duyệt. Bạn có thể đăng nhập FIThread, "
                        + "cập nhật thông tin công việc và xuất hiện trong danh bạ alumni.\n\n"
                        + "FIThread - Khoa CNTT, Đại học Hà Nội");
    }

    @Transactional
    public void reject(Long userId, String reason) {
        String cleanReason = reason == null ? "" : reason.trim();
        if (cleanReason.length() < 5) {
            throw new BusinessException("Vui long nhap ly do tu choi (it nhat 5 ky tu)");
        }

        User user = findAlumniUser(userId);
        if (user.getStatus() != UserStatus.PENDING_APPROVAL) {
            throw new BusinessException("Ho so khong o trang thai cho duyet", HttpStatus.CONFLICT);
        }

        user.setStatus(UserStatus.REJECTED);
        userRepository.save(user);
        discardPhoto(userId);

        mailService.sendPlain(user.getEmail(), "FIThread - Hồ sơ alumni chưa được duyệt",
                "Chào " + user.getFullName() + ",\n\n"
                        + "Hồ sơ cựu sinh viên của bạn chưa được duyệt.\nLý do: " + cleanReason + "\n\n"
                        + "Vui lòng liên hệ " + appProperties.getAlumni().getContactInfo()
                        + " để bổ sung minh chứng.\n\n"
                        + "FIThread - Khoa CNTT, Đại học Hà Nội");
    }

    // ---------- helpers ----------

    private User findAlumniUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.NOT_FOUND));
        if (user.getRole() != Role.ALUMNI) {
            throw new BusinessException("Tai khoan nay khong phai alumni");
        }
        return user;
    }

    /** Xoa tham chieu anh trong DB ngay, xoa file that sau khi transaction commit thanh cong. */
    private void discardPhoto(Long userId) {
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            String filename = profile.getCardPhotoPath();
            if (filename == null) return;

            profile.setCardPhotoPath(null);
            profileRepository.save(profile);

            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    photoStorage.delete(filename);
                }
            });
        });
    }
}