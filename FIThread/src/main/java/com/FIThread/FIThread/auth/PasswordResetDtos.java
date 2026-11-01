package com.FIThread.FIThread.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

public final class PasswordResetDtos {

    private PasswordResetDtos() {}

    @Getter
    @Setter
    public static class ForgotPasswordRequest {
        @NotBlank(message = "Vui long nhap email")
        @Size(max = 255, message = "Email qua dai")
        private String email;
    }

    @Getter
    @Setter
    public static class ResetPasswordRequest {
        @NotBlank(message = "Vui long nhap email")
        @Size(max = 255, message = "Email qua dai")
        private String email;

        @NotBlank(message = "Vui long nhap ma xac thuc")
        @Size(max = 10, message = "Ma xac thuc khong hop le")
        private String otp;

        @NotBlank(message = "Vui long nhap mat khau moi")
        @Size(min = 8, max = 72, message = "Mat khau moi phai tu 8 den 72 ky tu")
        private String newPassword;
    }
}