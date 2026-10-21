package com.FIThread.FIThread.account;

import com.FIThread.FIThread.account.AccountDtos.BatchRow;
import com.FIThread.FIThread.account.AccountDtos.CohortCount;
import com.FIThread.FIThread.account.AccountDtos.CohortGraduateRequest;
import com.FIThread.FIThread.account.AccountDtos.GraduationRequestRow;
import com.FIThread.FIThread.account.AccountDtos.GraduationYearRequest;
import com.FIThread.FIThread.account.AccountDtos.ReasonRequest;
import com.FIThread.FIThread.account.AccountDtos.StudentRow;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/graduation")
@RequiredArgsConstructor
public class AdminGraduationController {

    private final GraduationService graduationService;

    @GetMapping("/requests")
    public List<GraduationRequestRow> requests() {
        return graduationService.pendingRequests();
    }

    @PostMapping("/requests/{id}/approve")
    public Map<String, String> approve(@PathVariable Long id, Authentication auth) {
        graduationService.approve(auth.getName(), id);
        return Map.of("message", "Da duyet yeu cau tot nghiep");
    }

    @PostMapping("/requests/{id}/reject")
    public Map<String, String> reject(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                                      Authentication auth) {
        graduationService.reject(auth.getName(), id, request.getReason());
        return Map.of("message", "Da tu choi yeu cau tot nghiep");
    }

    @GetMapping("/cohorts")
    public List<CohortCount> cohorts() {
        return graduationService.cohorts();
    }

    @GetMapping("/cohort-students")
    public List<StudentRow> cohortStudents(@RequestParam String cohort) {
        return graduationService.cohortStudents(cohort);
    }

    @PostMapping("/users/{id}/graduate")
    public Map<String, String> graduateOne(@PathVariable Long id, @Valid @RequestBody GraduationYearRequest request,
                                           Authentication auth) {
        graduationService.graduateOne(auth.getName(), id, request.getGraduationYear());
        return Map.of("message", "Da chuyen thanh cuu sinh vien");
    }

    @PostMapping("/cohorts/graduate")
    public Map<String, Object> graduateSelected(@Valid @RequestBody CohortGraduateRequest request, Authentication auth) {
        int converted = graduationService.graduateSelected(
                auth.getName(), request.getCohort(), request.getGraduationYear(), request.getUserIds());
        return Map.of("message", "Da chuyen " + converted + " sinh vien thanh cuu sinh vien", "converted", converted);
    }

    @GetMapping("/batches")
    public List<BatchRow> batches() {
        return graduationService.batches();
    }

    @PostMapping("/batches/{id}/revert")
    public Map<String, Object> revertBatch(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                                           Authentication auth) {
        GraduationService.RevertResult result = graduationService.revertBatch(auth.getName(), id, request.getReason());
        return Map.of(
                "message", "Da hoan tac dot chuyen: " + result.reverted() + " nguoi duoc chuyen lai sinh vien"
                        + (result.skipped() > 0 ? ", bo qua " + result.skipped() + " nguoi khong con o trang thai phu hop" : ""),
                "reverted", result.reverted(),
                "skipped", result.skipped());
    }

    @PostMapping("/users/{id}/revert")
    public Map<String, String> revertOne(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                                         Authentication auth) {
        graduationService.revertOne(auth.getName(), id, request.getReason());
        return Map.of("message", "Da chuyen lai thanh sinh vien");
    }
}