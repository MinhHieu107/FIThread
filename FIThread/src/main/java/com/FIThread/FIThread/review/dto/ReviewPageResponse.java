package com.FIThread.FIThread.review.dto;

import java.util.List;

public record ReviewPageResponse(
        List<ReviewResponse> content,
        int page,
        int totalPages,
        long totalElements
) {}