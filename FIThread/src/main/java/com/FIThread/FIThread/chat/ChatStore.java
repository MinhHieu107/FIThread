package com.FIThread.FIThread.chat;

import com.FIThread.FIThread.analysis.ChatResult;
import com.FIThread.FIThread.analysis.ChatTurn;
import com.FIThread.FIThread.chat.ChatDtos.ChatMessageView;
import com.FIThread.FIThread.chat.ChatDtos.ChatReply;
import com.FIThread.FIThread.chat.ChatDtos.UnansweredResponse;
import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatStore {

    private final UserRepository userRepository;
    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final UnansweredQuestionRepository unansweredRepository;
    private final AppProperties appProperties;

    /** Lich su gan nhat cua cuoc tro chuyen (rong neu la cuoc moi). Kiem tra quyen so huu. */
    @Transactional(readOnly = true)
    public List<ChatTurn> loadHistory(String email, Long conversationId) {
        if (conversationId == null) return List.of();
        User user = findUser(email);
        ChatConversation conversation = findOwnedConversation(user, conversationId);

        List<ChatMessage> recent = new ArrayList<>(messageRepository.findByConversationIdOrderByIdDesc(
                conversation.getId(), PageRequest.of(0, appProperties.getChat().getHistoryMessages())));
        Collections.reverse(recent);

        return recent.stream()
                .map(m -> new ChatTurn(m.getRole() == ChatRole.USER ? "user" : "model", m.getContent()))
                .toList();
    }

    @Transactional
    public ChatReply save(String email, Long conversationId, String question, ChatResult result,
                          List<String> sourceTitles) {
        User user = findUser(email);

        ChatConversation conversation;
        if (conversationId == null) {
            conversation = new ChatConversation();
            conversation.setUser(user);
            conversation = conversationRepository.save(conversation);
        } else {
            conversation = findOwnedConversation(user, conversationId);
        }

        ChatMessage userMessage = new ChatMessage();
        userMessage.setConversation(conversation);
        userMessage.setRole(ChatRole.USER);
        userMessage.setContent(question);
        messageRepository.save(userMessage);

        AnswerStatus status = AnswerStatus.valueOf(result.status());
        ChatMessage botMessage = new ChatMessage();
        botMessage.setConversation(conversation);
        botMessage.setRole(ChatRole.BOT);
        botMessage.setContent(result.answer());
        botMessage.setAnswerStatus(status);
        botMessage.setSources(sourceTitles.isEmpty() ? null : truncate(String.join("\n", sourceTitles), 1000));
        messageRepository.save(botMessage);

        if (status == AnswerStatus.NO_INFO) {
            String text = truncate(question, 500);
            if (!unansweredRepository.existsByQuestionIgnoreCaseAndResolvedFalse(text)) {
                UnansweredQuestion unanswered = new UnansweredQuestion();
                unanswered.setQuestion(text);
                unansweredRepository.save(unanswered);
            }
        }

        return new ChatReply(conversation.getId(), botMessage.getId(), result.answer(), status.name(), sourceTitles);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageView> conversation(String email, Long conversationId) {
        User user = findUser(email);
        findOwnedConversation(user, conversationId);
        return messageRepository.findByConversationIdOrderByIdAsc(conversationId).stream()
                .map(this::toView)
                .toList();
    }

    @Transactional
    public void feedback(String email, Long messageId, boolean helpful) {
        User user = findUser(email);
        ChatMessage message = messageRepository.findByIdAndConversationUserId(messageId, user.getId())
                .orElseThrow(() -> new BusinessException("Khong tim thay tin nhan", HttpStatus.NOT_FOUND));
        if (message.getRole() != ChatRole.BOT) {
            throw new BusinessException("Chi danh gia duoc cau tra loi cua chatbot");
        }
        message.setHelpful(helpful);
        messageRepository.save(message);
    }

    // ---------- cau hoi chua tra loi duoc (cho admin) ----------

    @Transactional(readOnly = true)
    public List<UnansweredResponse> listUnanswered(boolean resolved) {
        return unansweredRepository.findByResolvedOrderByCreatedAtDesc(resolved, PageRequest.of(0, 200)).stream()
                .map(u -> new UnansweredResponse(u.getId(), u.getQuestion(), u.getCreatedAt(), u.isResolved()))
                .toList();
    }

    @Transactional
    public void resolveUnanswered(Long id) {
        UnansweredQuestion u = unansweredRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay cau hoi", HttpStatus.NOT_FOUND));
        u.setResolved(true);
        unansweredRepository.save(u);
    }

    @Transactional
    public void deleteUnanswered(Long id) {
        if (!unansweredRepository.existsById(id)) {
            throw new BusinessException("Khong tim thay cau hoi", HttpStatus.NOT_FOUND);
        }
        unansweredRepository.deleteById(id);
    }

    // ---------- helpers ----------

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.UNAUTHORIZED));
    }

    private ChatConversation findOwnedConversation(User user, Long id) {
        return conversationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new BusinessException("Khong tim thay cuoc tro chuyen", HttpStatus.NOT_FOUND));
    }

    private ChatMessageView toView(ChatMessage m) {
        List<String> sources = (m.getSources() == null || m.getSources().isBlank())
                ? List.of() : Arrays.asList(m.getSources().split("\n"));
        return new ChatMessageView(
                m.getId(), m.getRole().name(), m.getContent(),
                m.getAnswerStatus() == null ? null : m.getAnswerStatus().name(),
                sources, m.getHelpful());
    }

    private static String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }
}