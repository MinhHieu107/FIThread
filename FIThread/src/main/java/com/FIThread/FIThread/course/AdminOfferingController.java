package com.FIThread.FIThread.course;

import com.FIThread.FIThread.course.dto.CreateOfferingRequest;
import com.FIThread.FIThread.course.dto.OfferingResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/offerings")
@RequiredArgsConstructor
public class AdminOfferingController {

    private final OfferingService offeringService;

    @GetMapping
    public List<OfferingResponse> list() {
        return offeringService.findAll();
    }

    @PostMapping
    public OfferingResponse create(@Valid @RequestBody CreateOfferingRequest request) {
        return offeringService.create(request);
    }

    @PutMapping("/{id}")
    public OfferingResponse update(@PathVariable Long id, @Valid @RequestBody CreateOfferingRequest request) {
        return offeringService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {
        offeringService.delete(id);
        return Map.of("message", "Da xoa lan mo lop");
    }
}