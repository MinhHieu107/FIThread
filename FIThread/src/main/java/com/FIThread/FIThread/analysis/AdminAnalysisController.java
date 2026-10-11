package com.FIThread.FIThread.analysis;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/analysis")
@RequiredArgsConstructor
public class AdminAnalysisController {

    private final AnalysisService analysisService;

    @GetMapping("/summary")
    public Map<String, Long> summary() {
        return analysisService.summary();
    }

    @PostMapping("/requeue-failed")
    public Map<String, Integer> requeueFailed() {
        return Map.of("requeued", analysisService.requeueFailed());
    }

    @PostMapping("/backfill")
    public Map<String, Integer> backfill() {
        return Map.of("queued", analysisService.backfillMissing());
    }
}