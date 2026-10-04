package com.FIThread.FIThread.course.dto;

public record OfferingResponse(
        Long id,
        Long courseId,
        String courseCode,
        String courseName,
        Long lecturerId,
        String lecturerName,
        String semester
) {}