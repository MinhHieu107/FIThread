package com.FIThread.FIThread.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

public final class ChatDtos {

    private ChatDtos() {}

    @Getter
    @Setter
    public static class ChatRequest {
        private Long conversationId;

        @NotBlank(message = "Vui long nhap cau hoi")
        @Size(max = 2000, message = "Cau hoi qua dai")
        private String message;
    }

    @Getter
    @Setter
    public static class FeedbackRequest {
        @NotNull(message = "Thieu truong helpful")
        private Boolean helpful;
    }

    @Getter
    @Setter
    public static class KnowledgeDocRequest {
        @NotBlank(message = "Tieu de khong duoc de trong")
        @Size(max = 255, message = "Tieu de toi da 255 ky tu")
        private String title;

        @Size(max = 100, message = "Danh muc toi da 100 ky tu")
        private String category;

        @NotBlank(message = "Noi dung khong duoc de trong")
        @Size(max = 20000, message = "Noi dung toi da 20000 ky tu, hay chia thanh nhieu tai lieu")
        private String content;
    }

    public record ChatReply(Long conversationId, Long messageId, String answer, String status, List<String> sources) {}

    public record ChatMessageView(Long id, String role, String content, String status,
                                  List<String> sources, Boolean helpful) {}

    public record KnowledgeDocResponse(Long id, String title, String category, String content, Instant updatedAt) {}

    public record UnansweredResponse(Long id, String question, Instant createdAt, boolean resolved) {}
}