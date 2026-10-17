package com.FIThread.FIThread.chat;

import com.FIThread.FIThread.analysis.*;
import com.FIThread.FIThread.chat.ChatDtos.ChatReply;
import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.course.Course;
import com.FIThread.FIThread.course.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private static final int CATALOG_MAX_CHARS = 12000;

    private final ChatStore chatStore;
    private final RetrievalService retrievalService;
    private final CourseRepository courseRepository;
    private final AiClient aiClient;
    private final ChatRateLimiter rateLimiter;
    private final AppProperties appProperties;

    public ChatReply ask(String email, Long conversationId, String rawMessage) {
        AppProperties.Ai ai = appProperties.getAi();
        if (!ai.isEnabled() || ai.getApiKey() == null || ai.getApiKey().isBlank()) {
            throw new BusinessException("Chatbot chua duoc cau hinh", HttpStatus.SERVICE_UNAVAILABLE);
        }

        String message = rawMessage == null ? "" : rawMessage.trim();
        int max = appProperties.getChat().getMaxQuestionChars();
        if (message.isEmpty()) throw new BusinessException("Vui long nhap cau hoi");
        if (message.length() > max) throw new BusinessException("Cau hoi toi da " + max + " ky tu");

        rateLimiter.check(email);

        List<ChatTurn> history = chatStore.loadHistory(email, conversationId);
        List<KnowledgeService.Chunk> chunks = retrievalService.select(message);
        String userMessage = buildUserMessage(chunks, message);

        ChatResult result;
        try {
            result = aiClient.chat(PromptTemplates.CHAT_SYSTEM_PROMPT, history, userMessage);
        } catch (AiException e) {
            if (e.getKind() == AiException.Kind.BLOCKED) {
                result = new ChatResult(
                        "Mình không thể hỗ trợ nội dung này. Bạn thử đặt câu hỏi khác về khoa hoặc trường nhé.",
                        "OFF_TOPIC", List.of());
            } else {
                log.warn("Chatbot loi AI ({}): {}", e.getKind(), e.getMessage());
                String text = e.getKind() == AiException.Kind.RATE_LIMITED
                        ? "He thong AI dang qua tai, vui long thu lai sau it phut"
                        : "Chatbot tam thoi khong kha dung, vui long thu lai sau";
                throw new BusinessException(text, HttpStatus.SERVICE_UNAVAILABLE);
            }
        }

        List<String> sources = "ANSWERED".equals(result.status())
                ? resolveSources(chunks, result.sourceIds()) : List.of();
        return chatStore.save(email, conversationId, message, result, sources);
    }

    private String buildUserMessage(List<KnowledgeService.Chunk> chunks, String question) {
        StringBuilder sb = new StringBuilder("NGỮ CẢNH:\n");
        if (chunks.isEmpty()) {
            sb.append("(Không có tài liệu liên quan trong kho tri thức)\n\n");
        }
        for (int i = 0; i < chunks.size(); i++) {
            KnowledgeService.Chunk c = chunks.get(i);
            sb.append("[").append(i + 1).append("] (").append(c.title());
            if (c.category() != null) sb.append(" - ").append(c.category());
            sb.append(")\n").append(c.text()).append("\n\n");
        }

        String catalog = buildCatalogText();
        sb.append("DỮ LIỆU MÔN HỌC (từ hệ thống FIThread):\n")
                .append(catalog.isBlank() ? "(chưa có)\n" : catalog);

        sb.append("\nCÂU HỎI CỦA NGƯỜI DÙNG:\n<cau_hoi>\n")
                .append(question.replace("<", "‹").replace(">", "›"))
                .append("\n</cau_hoi>");
        return sb.toString();
    }

    private String buildCatalogText() {
        StringBuilder sb = new StringBuilder();
        for (Course c : courseRepository.findAll(Sort.by("code"))) {
            StringBuilder line = new StringBuilder("- ")
                    .append(c.getCode()).append(" | ").append(c.getName())
                    .append(" | ").append(c.getCredits()).append(" tín chỉ")
                    .append(" | ").append(c.isRequired() ? "bắt buộc" : "không bắt buộc");
            if (c.getSpecialization() != null) line.append(" | chuyên ngành ").append(c.getSpecialization());
            line.append("\n");

            if (sb.length() + line.length() > CATALOG_MAX_CHARS) break;
            sb.append(line);
        }
        return sb.toString();
    }

    private List<String> resolveSources(List<KnowledgeService.Chunk> chunks, List<Integer> ids) {
        LinkedHashSet<String> titles = new LinkedHashSet<>();
        for (Integer id : ids) {
            if (id != null && id >= 1 && id <= chunks.size()) {
                titles.add(chunks.get(id - 1).title());
            }
        }
        return List.copyOf(titles);
    }
}