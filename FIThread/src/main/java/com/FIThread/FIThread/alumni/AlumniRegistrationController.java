package com.FIThread.FIThread.alumni;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AlumniRegistrationController {

    private final AlumniService alumniService;

    @PostMapping(value = "/api/auth/register-alumni", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> register(@RequestParam String email,
                                        @RequestParam String fullName,
                                        @RequestParam String password,
                                        @RequestParam String cohort,
                                        @RequestParam Integer graduationYear,
                                        @RequestParam(defaultValue = "false") boolean consent,
                                        @RequestParam("photo") MultipartFile photo) {
        alumniService.register(email, fullName, password, cohort, graduationYear, consent, photo);
        return Map.of("message", "Dang ky thanh cong, vui long kiem tra email de lay ma OTP");
    }
}