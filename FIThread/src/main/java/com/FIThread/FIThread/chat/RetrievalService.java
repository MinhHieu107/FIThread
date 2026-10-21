package com.FIThread.FIThread.chat;

import com.FIThread.FIThread.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RetrievalService {

    private static final int MAX_SELECTED = 12;
    private static final Set<String> STOPWORDS = Set.of(
            "la", "va", "cua", "co", "khong", "cho", "the", "nao", "gi", "duoc", "nhu", "nay", "do",
            "mot", "cac", "nhung", "voi", "tai", "trong", "khi", "hay", "ve", "de", "se", "da", "dang",
            "em", "toi", "minh", "ban", "bao", "nhieu");

    private final KnowledgeService knowledgeService;
    private final AppProperties appProperties;

    public List<KnowledgeService.Chunk> select(String question) {
        List<KnowledgeService.Chunk> all = knowledgeService.loadChunks();
        int budget = appProperties.getChat().getMaxContextChars();

        int total = all.stream().mapToInt(c -> c.text().length()).sum();
        if (total <= budget) return all; // kho nho: dua toan bo vao ngu canh

        Set<String> queryTokens = tokenize(question);
        if (queryTokens.isEmpty()) return List.of();

        int n = all.size();
        List<Set<String>> chunkTokens = all.stream().map(c -> tokenize(c.title() + " " + c.text())).toList();

        Map<String, Integer> docFreq = new HashMap<>();
        for (Set<String> tokens : chunkTokens) {
            for (String t : tokens) {
                if (queryTokens.contains(t)) docFreq.merge(t, 1, Integer::sum);
            }
        }

        record Scored(int index, double score) {}
        List<Scored> scored = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            double score = 0;
            for (String t : queryTokens) {
                if (chunkTokens.get(i).contains(t)) {
                    score += Math.log(1.0 + (double) n / (1 + docFreq.getOrDefault(t, 0)));
                }
            }
            if (score > 0) scored.add(new Scored(i, score));
        }
        scored.sort(Comparator.comparingDouble(Scored::score).reversed());

        List<KnowledgeService.Chunk> selected = new ArrayList<>();
        int used = 0;
        for (Scored s : scored) {
            KnowledgeService.Chunk chunk = all.get(s.index());
            if (!selected.isEmpty() && used + chunk.text().length() > budget) continue;
            selected.add(chunk);
            used += chunk.text().length();
            if (selected.size() >= MAX_SELECTED) break;
        }
        return selected;
    }

    static Set<String> tokenize(String text) {
        String normalized = Normalizer.normalize(text.toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('đ', 'd');
        Set<String> tokens = new HashSet<>();
        for (String t : normalized.split("[^a-z0-9]+")) {
            if (t.length() >= 2 && !STOPWORDS.contains(t)) tokens.add(t);
        }
        return tokens;
    }
}