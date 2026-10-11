package com.FIThread.FIThread.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private List<String> allowedEmailDomains;
    private int otpExpiryMinutes = 15;
    private int otpMaxAttempts = 5;
    private String jwtSecret;
    private int jwtExpirationHours = 24;
    private int refreshExpirationDays = 30;
    private int minReviewsForStats = 5;
    private int reportsToAutoHide = 3;

    public int getReportsToAutoHide() { return reportsToAutoHide; }
    public void setReportsToAutoHide(int reportsToAutoHide) { this.reportsToAutoHide = reportsToAutoHide; }
    public int getMinReviewsForStats() { return minReviewsForStats; }
    public void setMinReviewsForStats(int minReviewsForStats) { this.minReviewsForStats = minReviewsForStats; }
    public int getRefreshExpirationDays() { return refreshExpirationDays; }
    public void setRefreshExpirationDays(int refreshExpirationDays) { this.refreshExpirationDays = refreshExpirationDays; }
    public String getJwtSecret() { return jwtSecret; }
    public void setJwtSecret(String jwtSecret) { this.jwtSecret = jwtSecret; }
    public int getJwtExpirationHours() { return jwtExpirationHours; }
    public void setJwtExpirationHours(int jwtExpirationHours) { this.jwtExpirationHours = jwtExpirationHours; }
    public List<String> getAllowedEmailDomains() { return allowedEmailDomains; }
    public void setAllowedEmailDomains(List<String> allowedEmailDomains) { this.allowedEmailDomains = allowedEmailDomains; }
    public int getOtpExpiryMinutes() { return otpExpiryMinutes; }
    public void setOtpExpiryMinutes(int otpExpiryMinutes) { this.otpExpiryMinutes = otpExpiryMinutes; }
    public int getOtpMaxAttempts() { return otpMaxAttempts; }
    public void setOtpMaxAttempts(int otpMaxAttempts) { this.otpMaxAttempts = otpMaxAttempts; }
    private Ai ai = new Ai();

    public Ai getAi() { return ai; }
    public void setAi(Ai ai) { this.ai = ai; }

    @lombok.Getter
    @lombok.Setter
    public static class Ai {
        private boolean enabled = true;
        private String apiKey;
        private String model = "gemini-3.5-flash-lite";
        private String baseUrl = "https://generativelanguage.googleapis.com/v1beta";
        private long minIntervalMs = 6000;   // giãn cách giữa 2 lần gọi API
        private int maxAttempts = 5;
        private int batchSize = 10;
        private long pollIntervalMs = 5000;
    }

}