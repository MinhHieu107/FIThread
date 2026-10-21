package com.FIThread.FIThread.chat;

import com.FIThread.FIThread.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KnowledgeService {

    private static final int CHUNK_TARGET = 1200;

    private final KbDocumentRepository repository;

    public record Chunk(Long documentId, String title, String category, String text) {}

    @Transactional(readOnly = true)
    public List<KbDocument> list() {
        return repository.findAllByOrderByIdAsc();
    }

    @Transactional
    public KbDocument create(String title, String category, String content) {
        KbDocument doc = new KbDocument();
        apply(doc, title, category, content);
        return repository.saveAndFlush(doc);
    }

    @Transactional
    public KbDocument update(Long id, String title, String category, String content) {
        KbDocument doc = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay tai lieu", HttpStatus.NOT_FOUND));
        apply(doc, title, category, content);
        return repository.saveAndFlush(doc);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new BusinessException("Khong tim thay tai lieu", HttpStatus.NOT_FOUND);
        }
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Chunk> loadChunks() {
        List<Chunk> chunks = new ArrayList<>();
        for (KbDocument doc : repository.findAllByOrderByIdAsc()) {
            for (String text : split(doc.getContent())) {
                chunks.add(new Chunk(doc.getId(), doc.getTitle(), doc.getCategory(), text));
            }
        }
        return chunks;
    }

    private void apply(KbDocument doc, String title, String category, String content) {
        doc.setTitle(title.trim());
        doc.setCategory(category == null || category.isBlank() ? null : category.trim());
        doc.setContent(content.trim());
    }

    /** Gom cac doan van thanh cac khoi khoang 1200 ky tu, khong cat giua cau neu co the. */
    static List<String> split(String text) {
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();

        for (String paragraph : text.replace("\r\n", "\n").split("\n\\s*\n")) {
            String p = paragraph.trim();
            while (p.length() > CHUNK_TARGET) {
                int cut = lastBreak(p, CHUNK_TARGET);
                flush(chunks, current);
                chunks.add(p.substring(0, cut).trim());
                p = p.substring(cut).trim();
            }
            if (p.isEmpty()) continue;

            if (current.length() > 0 && current.length() + p.length() + 2 > CHUNK_TARGET) {
                flush(chunks, current);
            }
            if (current.length() > 0) current.append("\n\n");
            current.append(p);
        }
        flush(chunks, current);
        return chunks;
    }

    private static int lastBreak(String s, int max) {
        int cut = Math.max(s.lastIndexOf(". ", max), s.lastIndexOf('\n', max));
        if (cut < max / 2) cut = s.lastIndexOf(' ', max);
        if (cut <= 0) cut = max;
        return Math.min(cut + 1, s.length());
    }

    private static void flush(List<String> chunks, StringBuilder current) {
        if (current.length() > 0) {
            chunks.add(current.toString());
            current.setLength(0);
        }
    }
}