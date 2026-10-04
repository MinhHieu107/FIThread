package com.FIThread.FIThread.course;

import com.FIThread.FIThread.course.dto.CreateOfferingRequest;
import com.FIThread.FIThread.course.dto.OfferingResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/offerings")
@RequiredArgsConstructor
public class AdminOfferingController {

    private final OfferingService offeringService;

    @PostMapping
    public OfferingResponse create(@Valid @RequestBody CreateOfferingRequest request) {
        return offeringService.create(request);
    }
}