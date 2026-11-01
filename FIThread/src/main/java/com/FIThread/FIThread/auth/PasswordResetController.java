package com.FIThread.FIThread.auth;

import com.FIThread.FIThread.auth.PasswordResetDtos.ForgotPasswordRequest;
import com.FIThread.FIThread.auth.PasswordResetDtos.ResetPasswordRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public Map<String, String> forgot(@Valid @RequestBody ForgotPasswordRequest request) {
        return Map.of("message", passwordResetService.requestReset(request.getEmail()));
    }

    @PostMapping("/reset-password")
    public Map<String, String> reset(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return Map.of("message", "Da dat lai mat khau, ban co the dang nhap bang mat khau moi");
    }
}