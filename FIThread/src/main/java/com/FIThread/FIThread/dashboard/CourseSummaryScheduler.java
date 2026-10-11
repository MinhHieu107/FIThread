package com.FIThread.FIThread.dashboard;

import com.FIThread.FIThread.analysis.AiClient;
import com.FIThread.FIThread.analysis.AiException;
import com.FIThread.FIThread.analysis.CourseSummaryResult;
import com.FIThread.FIThread.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class CourseSummaryScheduler {

    private final CourseSummaryService summaryService;
    private final AiClient aiClient;
    private final AppProperties appProperties;

    /** Mon vua loi: tam nghi mot luc truoc khi thu lai (chi luu trong bo nho). */
    private final Map<Long, Instant> retryAfter = new ConcurrentHashMap<>();

    @Scheduled(fixedDelayString = "${app.ai.summary-poll-interval-ms:30000}")
    public void refreshSummaries() {
        AppProperties.Ai ai = appProperties.getAi();
        if (!ai.isEnabled() || ai.getApiKey() == null || ai.getApiKey().isBlank()) return;

        List<Long> stale = summaryService.findStaleCourseIds();
        for (Long courseId : stale) {
            if (retryAfter.getOrDefault(courseId, Instant.EPOCH).isAfter(Instant.now())) continue;

            Optional<CourseSummaryService.SummaryJob> job = summaryService.buildJob(courseId);
            if (job.isEmpty()) continue;

            try {
                CourseSummaryResult result = aiClient.summarizeCourse(job.get().input());
                summaryService.save(courseId, job.get().eligibleCount(), result);
                retryAfter.remove(courseId);
                log.info("Da cap nhat tom tat AI cho mon hoc id={}", courseId);
            } catch (AiException e) {
                if (e.getKind() == AiException.Kind.RATE_LIMITED) {
                    log.warn("Gemini gioi han toc do, tam dung tao tom tat");
                    return;
                }
                Duration pause = e.getKind() == AiException.Kind.BLOCKED ? Duration.ofMinutes(30) : Duration.ofMinutes(5);
                retryAfter.put(courseId, Instant.now().plus(pause));
                log.warn("Tao tom tat that bai (courseId={}, {}): {}", courseId, e.getKind(), e.getMessage());
            } catch (Exception e) {
                retryAfter.put(courseId, Instant.now().plus(Duration.ofMinutes(5)));
                log.error("Loi khong mong doi khi tao tom tat courseId={}", courseId, e);
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