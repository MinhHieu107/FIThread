package com.FIThread.FIThread.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

public final class AccountDtos {

    private AccountDtos() {}

    public record UserRow(Long id, String fullName, String email, String role, String status,
                          String cohort, Instant createdAt, String backupEmail, boolean backupEmailVerified,
                          boolean convertedFromStudent) {}

    public record UserPage(List<UserRow> content, int page, int totalPages, long totalElements) {}

    public record BackupEmailStatus(String email, boolean verified, boolean required) {}

    public record GraduationRequestView(Long id, int graduationYear, String status, String reason, Instant createdAt) {}

    public record GraduationRequestRow(Long id, Long userId, String fullName, String email, String cohort,
                                       int graduationYear, String backupEmail, Instant createdAt) {}

    public record CohortCount(String cohort, long count) {}

    public record StudentRow(Long id, String fullName, String email) {}

    public record BatchRow(Long id, String cohort, int graduationYear, int studentCount, int remaining, int filled,
                           Instant createdAt, String createdByName, boolean reverted, Instant revertedAt) {}

    @Getter
    @Setter
    public static class ReasonRequest {
        @Size(max = 500, message = "Ly do toi da 500 ky tu")
        private String reason;
    }

    @Getter
    @Setter
    public static class PasswordRequest {
        @NotBlank(message = "Vui long nhap mat khau")
        @Size(max = 200, message = "Mat khau qua dai")
        private String password;
    }

    @Getter
    @Setter
    public static class EmailRequest {
        @NotBlank(message = "Vui long nhap email")
        @Size(max = 255, message = "Email qua dai")
        private String email;
    }

    @Getter
    @Setter
    public static class OtpRequest {
        @NotBlank(message = "Vui long nhap ma xac thuc")
        @Size(max = 10, message = "Ma xac thuc khong hop le")
        private String otp;
    }

    @Getter
    @Setter
    public static class GraduationYearRequest {
        @NotNull(message = "Vui long nhap nam tot nghiep")
        private Integer graduationYear;
    }

    @Getter
    @Setter
    public static class CohortGraduateRequest {
        @NotBlank(message = "Vui long chon khoa")
        @Size(max = 20, message = "Khoa toi da 20 ky tu")
        private String cohort;

        @NotNull(message = "Vui long nhap nam tot nghiep")
        private Integer graduationYear;

        @NotEmpty(message = "Vui long chon it nhat mot sinh vien")
        private List<Long> userIds;
    }
}