package com.FIThread.FIThread.analysis;

import java.util.List;
import java.util.Map;

public record CourseSummaryInput(
        String courseName,
        int analyzedCount,
        Map<String, Double> criterionAverages,
        int positive,
        int neutral,
        int negative,
        List<String> topThemes,
        List<String> comments
) {}