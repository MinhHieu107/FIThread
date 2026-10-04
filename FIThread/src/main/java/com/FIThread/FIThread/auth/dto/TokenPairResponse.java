package com.FIThread.FIThread.auth.dto;

public record TokenPairResponse(
        String accessToken,
        String refreshToken,
        String fullName,
        String role
) {}