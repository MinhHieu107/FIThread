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
}