package com.FIThread.FIThread.analysis;

import com.FIThread.FIThread.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalysisScheduler {

    private final AnalysisService analysisService;
    private final AiClient aiClient;
    private final AppProperties appProperties;

    private boolean warnedMissingKey = false;

    @Scheduled(fixedDelayString = "${app.ai.poll-interval-ms:5000}")
    public void processPending() {
        AppProperties.Ai ai = appProperties.getAi();

        if (!ai.isEnabled()) return;
        if (ai.getApiKey() == null || ai.getApiKey().isBlank()) {
            if (!warnedMissingKey) {
                log.warn("Chua cau hinh GEMINI_API_KEY: bo qua phan tich AI");
                warnedMissingKey = true;
            }
            return;
        }

        List<Long> ids = analysisService.findDueIds(ai.getBatchSize());
        for (Long id : ids) {
            Optional<AnalysisService.Pending> pending = analysisService.loadPending(id);
            if (pending.isEmpty()) continue;

            String comment = pending.get().comment();
            try {
                ReviewAnalysisResult result = aiClient.analyzeReview(comment);
                analysisService.saveResult(id, comment, result);
            } catch (AiException e) {
                switch (e.getKind()) {
                    case BLOCKED -> analysisService.saveBlocked(id, comment);
                    case RATE_LIMITED -> {
                        analysisService.defer(id, Duration.ofSeconds(60));
                        log.warn("Gemini gioi han toc do, tam dung phan tich 60 giay");
                        return;
                    }
                    default -> {
                        analysisService.saveFailure(id, e.getMessage(), e.getKind());
                        log.warn("Phan tich danh gia that bai (analysisId={}, {}): {}", id, e.getKind(), e.getMessage());
                    }
                }
            } catch (Exception e) {
                analysisService.saveFailure(id, "Loi khong mong doi: " + e.getMessage(), AiException.Kind.RETRYABLE);
                log.error("Loi khong mong doi khi phan tich analysisId={}", id, e);
            }

            try {
                Thread.sleep(ai.getMinIntervalMs());
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }
}