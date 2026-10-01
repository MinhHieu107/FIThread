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

    public List<String> getAllowedEmailDomains() { return allowedEmailDomains; }
    public void setAllowedEmailDomains(List<String> allowedEmailDomains) { this.allowedEmailDomains = allowedEmailDomains; }
    public int getOtpExpiryMinutes() { return otpExpiryMinutes; }
    public void setOtpExpiryMinutes(int otpExpiryMinutes) { this.otpExpiryMinutes = otpExpiryMinutes; }
    public int getOtpMaxAttempts() { return otpMaxAttempts; }
    public void setOtpMaxAttempts(int otpMaxAttempts) { this.otpMaxAttempts = otpMaxAttempts; }
}