package com.FIThread.FIThread.analysis;

public class AiException extends RuntimeException {

    public enum Kind {
        RATE_LIMITED,  // HTTP 429: tam dung, thu lai sau
        RETRYABLE,     // loi mang / 5xx / phan hoi khong doc duoc: thu lai
        FATAL,         // sai key, sai cau hinh: khong thu lai
        BLOCKED        // Gemini tu choi xu ly vi noi dung vi pham an toan
    }

    private final Kind kind;

    public AiException(String message, Kind kind) {
        super(message);
        this.kind = kind;
    }

    public Kind getKind() {
        return kind;
    }
}