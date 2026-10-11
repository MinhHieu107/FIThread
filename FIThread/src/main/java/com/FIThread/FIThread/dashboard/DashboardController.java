package com.FIThread.FIThread.dashboard;

import com.FIThread.FIThread.dashboard.DashboardDtos.DashboardCourseResponse;
import com.FIThread.FIThread.dashboard.DashboardDtos.DashboardOverviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public DashboardOverviewResponse overview() {
        return dashboardService.overview();
    }

    @GetMapping("/courses/{id}")
    public DashboardCourseResponse course(@PathVariable Long id) {
        return dashboardService.courseDetail(id);
    }
}