package com.FIThread.FIThread.auth;

import com.FIThread.FIThread.alumni.AlumniProfileRepository;
import com.FIThread.FIThread.auth.dto.*;
import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import com.FIThread.FIThread.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.user.UserStatus;
import org.springframework.http.HttpStatus;
import com.FIThread.FIThread.user.Role;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final EmailVerificationService emailVerificationService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;
    private final AlumniProfileRepository alumniProfileRepository;
    @PostMapping("/register")
    public Map<String, String> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request);
        return Map.of("message", "Dang ky thanh cong, vui long kiem tra email de lay ma OTP");
    }

    @PostMapping("/verify")
    public Map<String, String> verify(@Valid @RequestBody VerifyRequest request) {
        UserStatus status = emailVerificationService.verify(request.getEmail(), request.getOtp());
        String message = status == UserStatus.PENDING_APPROVAL
                ? "Xac thuc email thanh cong. Ho so cua ban dang cho admin duyet, ban se nhan email thong bao ket qua."
                : "Xac thuc thanh cong, ban co the dang nhap";
        return Map.of("message", message, "status", status.name());
    }

    @PostMapping("/login")
    public TokenPairResponse login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Sai email hoac mat khau"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Sai email hoac mat khau");
        }

        switch (user.getStatus()) {
            case PENDING_EMAIL -> throw new BusinessException(
                    "Tai khoan chua xac thuc email, vui long xac thuc bang ma OTP", HttpStatus.FORBIDDEN);
            case PENDING_APPROVAL -> throw new BusinessException(
                    "Ho so alumni cua ban dang cho admin duyet, ban se nhan email thong bao ket qua", HttpStatus.FORBIDDEN);
            case REJECTED -> throw new BusinessException(
                    "Ho so alumni chua duoc duyet. Vui long lien he "
                            + appProperties.getAlumni().getContactInfo() + " de bo sung minh chung",
                    HttpStatus.FORBIDDEN);
            case BANNED -> throw new BusinessException("Tai khoan da bi khoa", HttpStatus.FORBIDDEN);
            case ACTIVE -> { }
            case DELETED -> throw new BadCredentialsException("Sai email hoac mat khau");
        }

        String accessToken = jwtService.generateToken(user.getEmail(), user.getRole().name());
        String refreshToken = refreshTokenService.issue(user);
        return new TokenPairResponse(accessToken, refreshToken, user.getFullName(), user.getRole().name());
    }

    @PostMapping("/resend-otp")
    public Map<String, String> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung"));
        emailVerificationService.sendOtp(user);
        return Map.of("message", "Da gui lai ma OTP");
    }

    @PostMapping("/refresh")
    public TokenPairResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return refreshTokenService.rotate(request.getRefreshToken());
    }

    @PostMapping("/logout")
    public Map<String, String> logout(@Valid @RequestBody RefreshRequest request) {
        refreshTokenService.revoke(request.getRefreshToken());
        return Map.of("message", "Da dang xuat");
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.UNAUTHORIZED));

        boolean needsBackupEmail = user.getRole() == Role.ALUMNI
                && alumniProfileRepository.findByUserId(user.getId())
                .map(p -> p.isBackupEmailRequired() && !p.isBackupEmailVerified())
                .orElse(false);

        return Map.of("email", user.getEmail(), "fullName", user.getFullName(),
                "role", user.getRole().name(), "needsBackupEmail", needsBackupEmail);
    }
}