package com.FIThread.FIThread.alumni;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

public final class AlumniDtos {

    private AlumniDtos() {}

    public record AlumniSummary(Long id, String fullName, String cohort, int graduationYear,
                                String company, String positionTitle, String industry) {}

    public record AlumniPage(List<AlumniSummary> content, int page, int totalPages, long totalElements) {}

    public record AlumniDetail(Long id, String fullName, String cohort, int graduationYear,
                               String company, String positionTitle, String industry, String bio,
                               boolean contactVisible, String linkedinUrl, String email) {}

    public record MyProfile(Long id, String fullName, String email, String cohort, int graduationYear,
                            String company, String positionTitle, String industry, String bio,
                            String linkedinUrl, boolean contactVisible) {}

    public record ApplicationResponse(Long userId, String fullName, String email, String cohort,
                                      int graduationYear, Instant appliedAt, boolean hasPhoto) {}

    @Getter
    @Setter
    public static class UpdateProfileRequest {
        @Size(max = 255, message = "Cong ty toi da 255 ky tu")
        private String company;

        @Size(max = 255, message = "Vi tri toi da 255 ky tu")
        private String positionTitle;

        @Size(max = 100, message = "Nganh nghe toi da 100 ky tu")
        private String industry;

        @Size(max = 1000, message = "Gioi thieu toi da 1000 ky tu")
        private String bio;

        @Size(max = 255, message = "Duong dan LinkedIn toi da 255 ky tu")
        private String linkedinUrl;

        private Boolean contactVisible;
    }

    @Getter
    @Setter
    public static class ReasonRequest {
        @Size(max = 500, message = "Ly do toi da 500 ky tu")
        private String reason;
    }
}