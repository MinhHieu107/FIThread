package com.FIThread.FIThread.alumni;

import com.FIThread.FIThread.alumni.AlumniDtos.ApplicationResponse;
import com.FIThread.FIThread.alumni.AlumniDtos.ReasonRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/alumni")
@RequiredArgsConstructor
public class AdminAlumniController {

    private final AlumniService alumniService;

    @GetMapping("/applications")
    public List<ApplicationResponse> applications(@RequestParam(defaultValue = "PENDING_APPROVAL") String status) {
        return alumniService.applications(status);
    }

    @GetMapping("/{userId}/photo")
    public ResponseEntity<Resource> photo(@PathVariable Long userId) {
        AlumniService.PhotoFile file = alumniService.photo(userId);
        return ResponseEntity.ok()
                .contentType(file.mediaType())
                .header("Cache-Control", "no-store")
                .body(file.resource());
    }

    @PostMapping("/{userId}/approve")
    public Map<String, String> approve(@PathVariable Long userId) {
        alumniService.approve(userId);
        return Map.of("message", "Da duyet ho so");
    }

    @PostMapping("/{userId}/reject")
    public Map<String, String> reject(@PathVariable Long userId, @Valid @RequestBody ReasonRequest request) {
        alumniService.reject(userId, request.getReason());
        return Map.of("message", "Da tu choi ho so");
    }
}