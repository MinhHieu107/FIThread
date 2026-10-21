package com.FIThread.FIThread.chat;

import com.FIThread.FIThread.chat.ChatDtos.KnowledgeDocRequest;
import com.FIThread.FIThread.chat.ChatDtos.KnowledgeDocResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/knowledge")
@RequiredArgsConstructor
public class AdminKnowledgeController {

    private final KnowledgeService knowledgeService;

    @GetMapping
    public List<KnowledgeDocResponse> list() {
        return knowledgeService.list().stream().map(this::toResponse).toList();
    }

    @PostMapping
    public KnowledgeDocResponse create(@Valid @RequestBody KnowledgeDocRequest request) {
        return toResponse(knowledgeService.create(request.getTitle(), request.getCategory(), request.getContent()));
    }

    @PutMapping("/{id}")
    public KnowledgeDocResponse update(@PathVariable Long id, @Valid @RequestBody KnowledgeDocRequest request) {
        return toResponse(knowledgeService.update(id, request.getTitle(), request.getCategory(), request.getContent()));
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {
        knowledgeService.delete(id);
        return Map.of("message", "Da xoa tai lieu");
    }

    private KnowledgeDocResponse toResponse(KbDocument d) {
        return new KnowledgeDocResponse(d.getId(), d.getTitle(), d.getCategory(), d.getContent(), d.getUpdatedAt());
    }
}