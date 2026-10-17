package com.FIThread.FIThread.alumni;

import com.FIThread.FIThread.alumni.AlumniDtos.*;
import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import com.FIThread.FIThread.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AlumniDirectoryService {

    public static final List<String> INDUSTRIES = List.of(
            "Phát triển phần mềm",
            "Dịch vụ công nghệ thông tin",
            "Trí tuệ nhân tạo & Dữ liệu",
            "An toàn thông tin",
            "Tài chính – Ngân hàng",
            "Thương mại điện tử",
            "Viễn thông",
            "Giáo dục – Nghiên cứu",
            "Sản xuất – Công nghiệp",
            "Khởi nghiệp",
            "Khác");

    private final AlumniProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AlumniPage search(String q, String industry, Integer year, int page, int size) {
        String pattern = (q == null || q.isBlank()) ? null : "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
        String industryFilter = (industry == null || industry.isBlank()) ? null : industry.trim();

        PageRequest pageable = PageRequest.of(
                Math.max(page, 0), Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Order.desc("graduationYear"), Sort.Order.asc("user.fullName")));

        Page<AlumniProfile> result = profileRepository.search(UserStatus.ACTIVE, pattern, industryFilter, year, pageable);

        List<AlumniSummary> content = result.getContent().stream()
                .map(p -> new AlumniSummary(p.getId(), p.getUser().getFullName(), p.getUser().getCohort(),
                        p.getGraduationYear(), p.getCompany(), p.getPositionTitle(), p.getIndustry()))
                .toList();
        return new AlumniPage(content, result.getNumber(), result.getTotalPages(), result.getTotalElements());
    }

    /** Thong tin lien he (LinkedIn, email) chi tra ve khi alumni da bat chia se. */
    @Transactional(readOnly = true)
    public AlumniDetail detail(Long id) {
        AlumniProfile p = profileRepository.findByIdAndUserStatus(id, UserStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException("Khong tim thay alumni", HttpStatus.NOT_FOUND));
        User u = p.getUser();
        boolean visible = p.isContactVisible();

        return new AlumniDetail(p.getId(), u.getFullName(), u.getCohort(), p.getGraduationYear(),
                p.getCompany(), p.getPositionTitle(), p.getIndustry(), p.getBio(),
                visible, visible ? p.getLinkedinUrl() : null, visible ? u.getEmail() : null);
    }

    @Transactional(readOnly = true)
    public MyProfile myProfile(String email) {
        return toMyProfile(findProfile(email));
    }

    @Transactional
    public MyProfile updateMyProfile(String email, UpdateProfileRequest req) {
        AlumniProfile p = findProfile(email);

        String industry = blankToNull(req.getIndustry());
        if (industry != null && !INDUSTRIES.contains(industry)) {
            throw new BusinessException("Nganh nghe khong hop le");
        }
        String linkedin = blankToNull(req.getLinkedinUrl());
        if (linkedin != null && !linkedin.matches("^https://[^\\s]{3,}$")) {
            throw new BusinessException("Duong dan LinkedIn phai bat dau bang https://");
        }

        p.setCompany(blankToNull(req.getCompany()));
        p.setPositionTitle(blankToNull(req.getPositionTitle()));
        p.setIndustry(industry);
        p.setBio(blankToNull(req.getBio()));
        p.setLinkedinUrl(linkedin);
        p.setContactVisible(Boolean.TRUE.equals(req.getContactVisible()));
        profileRepository.save(p);

        return toMyProfile(p);
    }

    private AlumniProfile findProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.UNAUTHORIZED));
        return profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Khong tim thay ho so alumni", HttpStatus.NOT_FOUND));
    }

    private MyProfile toMyProfile(AlumniProfile p) {
        User u = p.getUser();
        return new MyProfile(p.getId(), u.getFullName(), u.getEmail(), u.getCohort(), p.getGraduationYear(),
                p.getCompany(), p.getPositionTitle(), p.getIndustry(), p.getBio(),
                p.getLinkedinUrl(), p.isContactVisible());
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}