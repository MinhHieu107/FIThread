package com.FIThread.FIThread.timeline;

import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.timeline.TimelineDtos.TimelineRequest;
import com.FIThread.FIThread.timeline.TimelineDtos.TimelineResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TimelineService {

    private final TimelineEventRepository repository;

    @Transactional(readOnly = true)
    public List<TimelineResponse> list() {
        return repository.findAllByOrderByEventYearAscIdAsc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TimelineResponse create(TimelineRequest request) {
        TimelineEvent event = new TimelineEvent();
        apply(event, request);
        return toResponse(repository.save(event));
    }

    @Transactional
    public TimelineResponse update(Long id, TimelineRequest request) {
        TimelineEvent event = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay su kien", HttpStatus.NOT_FOUND));
        apply(event, request);
        return toResponse(repository.save(event));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new BusinessException("Khong tim thay su kien", HttpStatus.NOT_FOUND);
        }
        repository.deleteById(id);
    }

    private void apply(TimelineEvent event, TimelineRequest request) {
        event.setEventYear(request.getYear());
        event.setTitle(request.getTitle().trim());
        String description = request.getDescription();
        event.setDescription(description == null || description.isBlank() ? null : description.trim());
    }

    private TimelineResponse toResponse(TimelineEvent e) {
        return new TimelineResponse(e.getId(), e.getEventYear(), e.getTitle(), e.getDescription());
    }
}