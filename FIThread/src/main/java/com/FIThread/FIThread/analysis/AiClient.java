package com.FIThread.FIThread.analysis;

public interface AiClient {
    ReviewAnalysisResult analyzeReview(String comment);

    CourseSummaryResult summarizeCourse(CourseSummaryInput input);
}