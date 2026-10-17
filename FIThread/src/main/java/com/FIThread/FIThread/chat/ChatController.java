package com.FIThread.FIThread.chat;

import com.FIThread.FIThread.chat.ChatDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatStore chatStore;

    @PostMapping
    public ChatReply ask(@Valid @RequestBody ChatRequest request, Authentication auth) {
        return chatService.ask(auth.getName(), request.getConversationId(), request.getMessage());
    }

    @GetMapping("/conversations/{id}")
    public List<ChatMessageView> conversation(@PathVariable Long id, Authentication auth) {
        return chatStore.conversation(auth.getName(), id);
    }

    @PostMapping("/messages/{id}/feedback")
    public Map<String, String> feedback(@PathVariable Long id,
                                        @Valid @RequestBody FeedbackRequest request,
                                        Authentication auth) {
        chatStore.feedback(auth.getName(), id, request.getHelpful());
        return Map.of("message", "Da ghi nhan phan hoi");
    }
}