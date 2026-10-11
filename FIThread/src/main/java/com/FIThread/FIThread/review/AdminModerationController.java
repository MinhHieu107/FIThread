package com.FIThread.FIThread.review;

import com.FIThread.FIThread.review.dto.ModerationReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/moderation")
@RequiredArgsConstructor
public class AdminModerationController {

    private final AdminModerationService moderationService;

    @GetMapping("/reviews")
    public List<ModerationReviewResponse> list(@RequestParam(defaultValue = "PENDING_MODERATION") String status) {
        return moderationService.list(status);
    }

    @PostMapping("/reviews/{id}/hide")
    public Map<String, String> hide(@PathVariable Long id) {
        moderationService.hide(id);
        return Map.of("message", "Da an danh gia");
    }

    @PostMapping("/reviews/{id}/restore")
    public Map<String, String> restore(@PathVariable Long id) {
        moderationService.restore(id);
        return Map.of("message", "Da hien thi lai danh gia");
    }
}