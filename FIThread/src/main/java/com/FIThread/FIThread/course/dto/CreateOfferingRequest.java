package com.FIThread.FIThread.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateOfferingRequest {
    @NotNull
    private Long courseId;

    @NotBlank
    private String lecturerName;

    @NotBlank
    private String semester;
}