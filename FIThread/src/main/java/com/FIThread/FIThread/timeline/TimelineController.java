package com.FIThread.FIThread.timeline;

import com.FIThread.FIThread.timeline.TimelineDtos.TimelineResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    @GetMapping("/api/timeline")
    public List<TimelineResponse> list() {
        return timelineService.list();
    }
}