package com.FIThread.FIThread.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
    Optional<ChatConversation> findByIdAndUserId(Long id, Long userId);
}