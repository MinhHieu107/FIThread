package com.FIThread.FIThread.auth;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = SchoolEmailValidator.class)
public @interface SchoolEmail {
    String message() default "Email phai thuoc domain cua truong";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}