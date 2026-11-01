package com.FIThread.FIThread.timeline;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

public final class TimelineDtos {

    private TimelineDtos() {}

    public record TimelineResponse(Long id, int year, String title, String description) {}

    @Getter
    @Setter
    public static class TimelineRequest {
        @NotNull(message = "Vui long nhap nam")
        @Min(value = 1900, message = "Nam khong hop le")
        @Max(value = 2100, message = "Nam khong hop le")
        private Integer year;

        @NotBlank(message = "Tieu de khong duoc de trong")
        @Size(max = 255, message = "Tieu de toi da 255 ky tu")
        private String title;

        @Size(max = 2000, message = "Mo ta toi da 2000 ky tu")
        private String description;
    }
}