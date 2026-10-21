package com.FIThread.FIThread.account;

import com.FIThread.FIThread.account.AccountDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final BackupEmailService backupEmailService;
    private final GraduationService graduationService;

    @PostMapping("/delete")
    public Map<String, String> deleteMe(@Valid @RequestBody PasswordRequest request, Authentication auth) {
        accountService.selfDelete(auth.getName(), request.getPassword());
        return Map.of("message", "Da xoa tai khoan");
    }

    @GetMapping("/backup-email")
    public BackupEmailStatus backupEmail(Authentication auth) {
        return backupEmailService.status(auth.getName());
    }

    @PostMapping("/backup-email/start")
    public Map<String, String> startBackupEmail(@Valid @RequestBody EmailRequest request, Authentication auth) {
        backupEmailService.start(auth.getName(), request.getEmail());
        return Map.of("message", "Da gui ma xac thuc");
    }

    @PostMapping("/backup-email/confirm")
    public Map<String, String> confirmBackupEmail(@Valid @RequestBody OtpRequest request, Authentication auth) {
        return Map.of("email", backupEmailService.confirm(auth.getName(), request.getOtp()));
    }

    @GetMapping("/graduation")
    public ResponseEntity<GraduationRequestView> graduation(Authentication auth) {
        GraduationRequestView view = graduationService.current(auth.getName());
        return view == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(view);
    }

    @PostMapping("/graduation-request")
    public GraduationRequestView submitGraduation(@Valid @RequestBody GraduationYearRequest request,
                                                  Authentication auth) {
        return graduationService.submit(auth.getName(), request.getGraduationYear());
    }
}