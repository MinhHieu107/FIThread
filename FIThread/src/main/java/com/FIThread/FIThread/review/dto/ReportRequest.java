package com.FIThread.FIThread.review.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportRequest {
    @Size(max = 500, message = "Ly do toi da 500 ky tu")
    private String reason;
}