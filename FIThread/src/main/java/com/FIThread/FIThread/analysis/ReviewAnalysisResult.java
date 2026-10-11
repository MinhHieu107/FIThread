package com.FIThread.FIThread.analysis;

import java.util.List;

public record ReviewAnalysisResult(
        Sentiment sentiment,
        double score,
        List<String> themes,
        String summary,
        boolean flagged
) {}