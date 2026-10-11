package com.FIThread.FIThread.review.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReviewRequest {

    @NotEmpty(message = "Vui long cham diem cac tieu chi")
    @Valid
    private List<ScoreInput> scores;

    @NotBlank(message = "Nhan xet khong duoc de trong")
    @Size(min = 20, max = 2000, message = "Nhan xet phai tu 20 den 2000 ky tu")
    private String comment;

    @Getter
    @Setter
    public static class ScoreInput {
        @NotNull(message = "Thieu ma tieu chi")
        private Long criterionId;

        @Min(value = 1, message = "Diem phai tu 1 den 5")
        @Max(value = 5, message = "Diem phai tu 1 den 5")
        private int score;
    }
}