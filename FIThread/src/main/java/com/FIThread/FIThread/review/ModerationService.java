package com.FIThread.FIThread.review;

import com.FIThread.FIThread.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

@Slf4j
@Service
public class ModerationService {

    private record BlockedTerm(String term, Pattern pattern) {}

    private final List<BlockedTerm> terms;

    public ModerationService() {
        this.terms = loadTerms();
        log.info("Da nap {} tu ngu kiem duyet", terms.size());
    }

    /** Nem BusinessException (400) neu van ban chua tu cam. */
    public void assertClean(String text) {
        findBlockedTerm(text).ifPresent(term -> {
            throw new BusinessException(
                    "\n" +
                            "Chúng mình là sinh viên đại học rồi ăn nói cẩn thận lại nhé");
        });
    }

    public Optional<String> findBlockedTerm(String text) {
        if (text == null || text.isBlank()) return Optional.empty();
        String normalized = normalize(text);
        for (BlockedTerm t : terms) {
            if (t.pattern().matcher(normalized).find()) {
                return Optional.of(t.term());
            }
        }
        return Optional.empty();
    }

    private static String normalize(String s) {
        return Normalizer.normalize(s, Normalizer.Form.NFC)
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ");
    }

    private List<BlockedTerm> loadTerms() {
        try (var in = new ClassPathResource("moderation/blocked_words.txt").getInputStream();
             var reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            return reader.lines()
                    .map(l -> l.replace("\uFEFF", "").trim())
                    .filter(l -> !l.isEmpty() && !l.startsWith("#"))
                    .map(ModerationService::normalize)
                    .distinct()
                    .map(w -> new BlockedTerm(w, Pattern.compile(
                            "(?<![\\p{L}\\p{N}])" + Pattern.quote(w) + "(?![\\p{L}\\p{N}])")))
                    .toList();
        } catch (IOException e) {
            log.warn("Khong doc duoc moderation/blocked_words.txt, bo qua kiem duyet tu ngu: {}", e.getMessage());
            return List.of();
        }
    }
}