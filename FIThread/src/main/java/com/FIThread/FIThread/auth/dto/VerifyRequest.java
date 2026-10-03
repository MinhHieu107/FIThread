package com.FIThread.FIThread.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyRequest {
    @NotBlank
    private String email;

    @NotBlank
    private String otp;
}