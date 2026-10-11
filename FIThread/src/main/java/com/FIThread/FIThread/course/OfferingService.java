package com.FIThread.FIThread.course;

import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.course.dto.CreateOfferingRequest;
import com.FIThread.FIThread.course.dto.OfferingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.FIThread.FIThread.review.ReviewRepository;
@Service
@RequiredArgsConstructor
public class OfferingService {

    private final CourseRepository courseRepository;
    private final LecturerRepository lecturerRepository;
    private final CourseOfferingRepository offeringRepository;
    private final ReviewRepository reviewRepository;

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
    @Transactional
    public OfferingResponse update(Long id, CreateOfferingRequest request) {
        CourseOffering offering = offeringRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay lan mo lop", HttpStatus.NOT_FOUND));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new BusinessException("Khong tim thay mon hoc", HttpStatus.NOT_FOUND));
        if (reviewRepository.existsByOfferingId(id)) {
            boolean changedCourse = !offering.getCourse().getId().equals(request.getCourseId());
            boolean changedSemester = !offering.getSemester().equals(request.getSemester().trim());
            if (changedCourse || changedSemester) {
                throw new BusinessException(
                        "Lan mo lop nay da co danh gia, chi duoc sua ten giang vien", HttpStatus.CONFLICT);
            }
        }
        Lecturer lecturer = lecturerRepository.findByFullName(request.getLecturerName().trim())
                .orElseGet(() -> {
                    Lecturer l = new Lecturer();
                    l.setFullName(request.getLecturerName().trim());
                    return lecturerRepository.save(l);
                });

        offering.setCourse(course);
        offering.setLecturer(lecturer);
        offering.setSemester(request.getSemester().trim());
        offeringRepository.save(offering);

        return toResponse(offering, course, lecturer);
    }

    @Transactional
    public void delete(Long id) {
        if (!offeringRepository.existsById(id)) {
            throw new BusinessException("Khong tim thay lan mo lop", HttpStatus.NOT_FOUND);
        }
        if (reviewRepository.existsByOfferingId(id)) {
            throw new BusinessException("Khong the xoa: lan mo lop nay da co danh gia", HttpStatus.CONFLICT);
        }
        offeringRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<OfferingResponse> findAll() {
        return offeringRepository.findAll().stream()
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