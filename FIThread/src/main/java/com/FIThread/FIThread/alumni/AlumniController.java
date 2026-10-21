package com.FIThread.FIThread.alumni;

import com.FIThread.FIThread.alumni.AlumniDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumni")
@RequiredArgsConstructor
public class AlumniController {

    private final AlumniDirectoryService directoryService;

    @GetMapping
    public AlumniPage search(@RequestParam(required = false) String q,
                             @RequestParam(required = false) String industry,
                             @RequestParam(required = false) Integer year,
                             @RequestParam(defaultValue = "0") int page,
                             @RequestParam(defaultValue = "12") int size) {
        return directoryService.search(q, industry, year, page, size);
    }

    @GetMapping("/industries")
    public List<String> industries() {
        return AlumniDirectoryService.INDUSTRIES;
    }

    @GetMapping("/me")
    public MyProfile me(Authentication auth) {
        return directoryService.myProfile(auth.getName());
    }

    @PutMapping("/me")
    public MyProfile updateMe(@Valid @RequestBody UpdateProfileRequest request, Authentication auth) {
        return directoryService.updateMyProfile(auth.getName(), request);
    }

    @GetMapping("/{id}")
    public AlumniDetail detail(@PathVariable Long id) {
        return directoryService.detail(id);
    }
}