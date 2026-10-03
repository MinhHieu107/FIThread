package com.FIThread.FIThread.auth;

import com.FIThread.FIThread.auth.dto.*;
import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import com.FIThread.FIThread.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final EmailVerificationService emailVerificationService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/register")
    public Map<String, String> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request);
        return Map.of("message", "Dang ky thanh cong, vui long kiem tra email de lay ma OTP");
    }

    @PostMapping("/verify")
    public Map<String, String> verify(@Valid @RequestBody VerifyRequest request) {
        emailVerificationService.verify(request.getEmail(), request.getOtp());
        return Map.of("message", "Xac thuc thanh cong, ban co the dang nhap");
    }

    @PostMapping("/resend-otp")
    public Map<String, String> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung"));
        emailVerificationService.sendOtp(user);
        return Map.of("message", "Da gui lai ma OTP");
    }

    @PostMapping("/login")
    public Map<String, String> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            throw new BadCredentialsException("Sai email hoac mat khau");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung"));

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return Map.of("token", token, "fullName", user.getFullName(), "role", user.getRole().name());
    }

    @GetMapping("/me")
    public Map<String, String> me(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung"));
        return Map.of("email", user.getEmail(), "fullName", user.getFullName(), "role", user.getRole().name());
    }
}