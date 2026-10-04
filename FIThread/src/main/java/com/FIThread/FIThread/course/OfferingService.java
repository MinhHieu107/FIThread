package com.FIThread.FIThread.course;

import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.course.dto.CreateOfferingRequest;
import com.FIThread.FIThread.course.dto.OfferingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferingService {

    private final CourseRepository courseRepository;
    private final LecturerRepository lecturerRepository;
    private final CourseOfferingRepository offeringRepository;

    @Transactional
    public OfferingResponse create(CreateOfferingRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new BusinessException("Khong tim thay mon hoc", HttpStatus.NOT_FOUND));

        Lecturer lecturer = lecturerRepository.findByFullName(request.getLecturerName().trim())
                .orElseGet(() -> {
                    Lecturer l = new Lecturer();
                    l.setFullName(request.getLecturerName().trim());
                    return lecturerRepository.save(l);
                });

        boolean exists = offeringRepository
                .findByCourseIdAndLecturerIdAndSemester(course.getId(), lecturer.getId(), request.getSemester())
                .isPresent();
        if (exists) {
            throw new BusinessException("Lan day nay da ton tai", HttpStatus.CONFLICT);
        }

        CourseOffering offering = new CourseOffering();
        offering.setCourse(course);
        offering.setLecturer(lecturer);
        offering.setSemester(request.getSemester().trim());
        offeringRepository.save(offering);

        return toResponse(offering, course, lecturer);
    }

    @Transactional(readOnly = true)
    public List<OfferingResponse> findByCourse(Long courseId) {
        return offeringRepository.findByCourseId(courseId).stream()
                .map(o -> toResponse(o, o.getCourse(), o.getLecturer()))
                .toList();
    }

    private OfferingResponse toResponse(CourseOffering o, Course course, Lecturer lecturer) {
        return new OfferingResponse(
                o.getId(),
                course.getId(),
                course.getCode(),
                course.getName(),
                lecturer.getId(),
                lecturer.getFullName(),
                o.getSemester()
        );
    }
}