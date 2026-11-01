package com.FIThread.FIThread.timeline;

import com.FIThread.FIThread.timeline.TimelineDtos.TimelineRequest;
import com.FIThread.FIThread.timeline.TimelineDtos.TimelineResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/timeline")
@RequiredArgsConstructor
public class AdminTimelineController {

    private final TimelineService timelineService;

    @GetMapping
    public List<TimelineResponse> list() {
        return timelineService.list();
    }

    @PostMapping
    public TimelineResponse create(@Valid @RequestBody TimelineRequest request) {
        return timelineService.create(request);
    }

    @PutMapping("/{id}")
    public TimelineResponse update(@PathVariable Long id, @Valid @RequestBody TimelineRequest request) {
        return timelineService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {
        timelineService.delete(id);
        return Map.of("message", "Da xoa su kien");
    }
}