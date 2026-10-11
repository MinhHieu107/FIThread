package com.FIThread.FIThread.analysis;

import com.FIThread.FIThread.config.AppProperties;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class GeminiAiClient implements AiClient {

    private final RestClient restClient;
    private final AppProperties.Ai config;
    private final ObjectMapper objectMapper;

    public GeminiAiClient(AppProperties appProperties, ObjectMapper objectMapper) {
        this.config = appProperties.getAi();
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(60));

        this.restClient = RestClient.builder()
                .baseUrl(config.getBaseUrl())
                .requestFactory(factory)
                .build();
    }

    @Override
    public ReviewAnalysisResult analyzeReview(String comment) {
        // Vo hieu hoa the "<...>" trong nhan xet de nguoi dung khong thoat khoi the <nhan_xet>
        String safeComment = comment.replace("<", "‹").replace(">", "›");

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", PromptTemplates.SYSTEM_PROMPT))),
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", "<nhan_xet>\n" + safeComment + "\n</nhan_xet>")))),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "responseJsonSchema", PromptTemplates.responseSchema())
        );

        GeminiResponse response;
        try {
            response = restClient.post()
                    .uri("/models/{model}:generateContent", config.getModel())
                    .header("x-goog-api-key", config.getApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GeminiResponse.class);
        } catch (RestClientResponseException e) {
            int status = e.getStatusCode().value();
            String detail = truncate(e.getResponseBodyAsString(), 300);
            if (status == 429) {
                throw new AiException("Gemini bao het han muc (429)", AiException.Kind.RATE_LIMITED);
            }
            AiException.Kind kind = status >= 500 ? AiException.Kind.RETRYABLE : AiException.Kind.FATAL;
            throw new AiException("Gemini tra ve HTTP " + status + ": " + detail, kind);
        } catch (RestClientException e) {
            throw new AiException("Khong goi duoc Gemini: " + e.getMessage(), AiException.Kind.RETRYABLE);
        }

        return parse(response);
    }

    private ReviewAnalysisResult parse(GeminiResponse response) {
        if (response == null) {
            throw new AiException("Gemini tra ve phan hoi rong", AiException.Kind.RETRYABLE);
        }
        if (response.promptFeedback() != null && response.promptFeedback().blockReason() != null) {
            throw new AiException("Gemini chan noi dung: " + response.promptFeedback().blockReason(),
                    AiException.Kind.BLOCKED);
        }

        GeminiResponse.Candidate candidate =
                (response.candidates() == null || response.candidates().isEmpty()) ? null : response.candidates().get(0);

        String text = "";
        if (candidate != null && candidate.content() != null && candidate.content().parts() != null) {
            text = candidate.content().parts().stream()
                    .map(GeminiResponse.Part::text)
                    .filter(t -> t != null)
                    .collect(Collectors.joining());
        }

        if (text.isBlank()) {
            String reason = candidate == null ? null : candidate.finishReason();
            if (reason != null && (reason.contains("SAFETY") || reason.contains("PROHIBITED") || reason.contains("BLOCK"))) {
                throw new AiException("Gemini chan noi dung: " + reason, AiException.Kind.BLOCKED);
            }
            throw new AiException("Gemini khong tra ve noi dung (finishReason=" + reason + ")",
                    AiException.Kind.RETRYABLE);
        }

        ModelOutput out;
        try {
            out = objectMapper.readValue(stripFences(text), ModelOutput.class);
        } catch (Exception e) {
            throw new AiException("Khong doc duoc JSON tu Gemini", AiException.Kind.RETRYABLE);
        }
        return sanitize(out);
    }

    private ReviewAnalysisResult sanitize(ModelOutput out) {
        double score = out.score() == null ? 0 : Math.max(-1.0, Math.min(1.0, out.score()));

        Sentiment sentiment;
        try {
            sentiment = Sentiment.valueOf(out.sentiment().trim().toUpperCase(Locale.ROOT));
        } catch (Exception e) {
            sentiment = score > 0.25 ? Sentiment.POSITIVE : score < -0.25 ? Sentiment.NEGATIVE : Sentiment.NEUTRAL;
        }

        List<String> themes = (out.themes() == null ? List.<String>of() : out.themes()).stream()
                .filter(t -> t != null)
                .map(t -> t.trim().toUpperCase(Locale.ROOT))
                .filter(PromptTemplates.THEMES::contains)
                .distinct()
                .limit(3)
                .toList();

        String summary = out.summary() == null ? "" : truncate(out.summary().trim(), 500);
        return new ReviewAnalysisResult(sentiment, score, themes, summary, Boolean.TRUE.equals(out.flagged()));
    }

    private static String stripFences(String text) {
        String t = text.trim();
        if (t.startsWith("```")) {
            int firstNewline = t.indexOf('\n');
            int lastFence = t.lastIndexOf("```");
            if (firstNewline > 0 && lastFence > firstNewline) {
                t = t.substring(firstNewline + 1, lastFence).trim();
            }
        }
        return t;
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GeminiResponse(List<Candidate> candidates, PromptFeedback promptFeedback) {
        @JsonIgnoreProperties(ignoreUnknown = true)
        record Candidate(Content content, String finishReason) {}

        @JsonIgnoreProperties(ignoreUnknown = true)
        record Content(List<Part> parts) {}

        @JsonIgnoreProperties(ignoreUnknown = true)
        record Part(String text) {}

        @JsonIgnoreProperties(ignoreUnknown = true)
        record PromptFeedback(String blockReason) {}
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ModelOutput(String sentiment, Double score, List<String> themes, String summary, Boolean flagged) {}
}