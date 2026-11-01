package com.FIThread.FIThread.forum;

import com.FIThread.FIThread.forum.ForumDtos.ModerationRow;
import com.FIThread.FIThread.forum.ForumDtos.ReasonRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/forum")
@RequiredArgsConstructor
public class AdminForumController {

    private final ForumService forumService;

    @GetMapping("/posts")
    public List<ModerationRow> list(@RequestParam(defaultValue = "PENDING_MODERATION") String status) {
        return forumService.adminList(status);
    }

    @PostMapping("/posts/{id}/hide")
    public Map<String, String> hide(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                                    Authentication auth) {
        forumService.hide(auth.getName(), id, request.getReason());
        return Map.of("message", "Da an bai viet");
    }

    @PostMapping("/posts/{id}/restore")
    public Map<String, String> restore(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                                       Authentication auth) {
        forumService.restore(auth.getName(), id, request.getReason());
        return Map.of("message", "Da hien thi lai bai viet");
    }
}