package com.FIThread.FIThread.course;

import com.FIThread.FIThread.course.dto.RubricCriterionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rubric")
@RequiredArgsConstructor
public class RubricController {

    private final RubricCriterionRepository rubricRepository;

    @GetMapping
    public List<RubricCriterionResponse> list() {
        return rubricRepository.findAllByOrderBySortOrderAsc().stream()
                .map(c -> new RubricCriterionResponse(c.getId(), c.getCode(), c.getName(), c.getDescription()))
                .toList();
    }
}