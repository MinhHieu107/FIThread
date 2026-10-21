package com.FIThread.FIThread.chat;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UnansweredQuestionRepository extends JpaRepository<UnansweredQuestion, Long> {
    List<UnansweredQuestion> findByResolvedOrderByCreatedAtDesc(boolean resolved, Pageable pageable);

    boolean existsByQuestionIgnoreCaseAndResolvedFalse(String question);
}