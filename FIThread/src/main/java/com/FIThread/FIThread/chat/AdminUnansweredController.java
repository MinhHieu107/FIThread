package com.FIThread.FIThread.chat;

import com.FIThread.FIThread.chat.ChatDtos.UnansweredResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/unanswered")
@RequiredArgsConstructor
public class AdminUnansweredController {

    private final ChatStore chatStore;

    @GetMapping
    public List<UnansweredResponse> list(@RequestParam(defaultValue = "false") boolean resolved) {
        return chatStore.listUnanswered(resolved);
    }

    @PostMapping("/{id}/resolve")
    public Map<String, String> resolve(@PathVariable Long id) {
        chatStore.resolveUnanswered(id);
        return Map.of("message", "Da danh dau da xu ly");
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {
        chatStore.deleteUnanswered(id);
        return Map.of("message", "Da xoa");
    }
}