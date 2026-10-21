package com.FIThread.FIThread.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface KbDocumentRepository extends JpaRepository<KbDocument, Long> {
    List<KbDocument> findAllByOrderByIdAsc();
}