package com.FIThread.FIThread.analysis;

import java.util.List;

public interface AiClient {
    ReviewAnalysisResult analyzeReview(String comment);

    CourseSummaryResult summarizeCourse(CourseSummaryInput input);

    ChatResult chat(String systemPrompt, List<ChatTurn> history, String userMessage);
}