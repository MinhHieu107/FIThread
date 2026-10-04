package com.FIThread.FIThread.course;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final OfferingService offeringService;

    @GetMapping
    public Page<Course> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return courseService.search(q, page, size);
    }

    @GetMapping("/{id}")
    public Course detail(@PathVariable Long id) {
        return courseService.getById(id);
    }

    @GetMapping("/{id}/offerings")
    public java.util.List<com.FIThread.FIThread.course.dto.OfferingResponse> offerings(@PathVariable Long id) {
        return offeringService.findByCourse(id);
    }
}