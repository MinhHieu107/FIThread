package com.FIThread.FIThread.auth;

import com.FIThread.FIThread.config.AppProperties;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SchoolEmailValidator implements ConstraintValidator<SchoolEmail, String> {

    private final AppProperties appProperties;

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || !email.contains("@")) return false;

        String domain = email.substring(email.indexOf('@') + 1).toLowerCase();
        return appProperties.getAllowedEmailDomains().stream()
                .anyMatch(allowed -> domain.equals(allowed.toLowerCase()));
    }
}