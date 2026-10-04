// course/CourseOfferingRepository.java
package com.FIThread.FIThread.course;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CourseOfferingRepository extends JpaRepository<CourseOffering, Long> {
    List<CourseOffering> findByCourseId(Long courseId);
    Optional<CourseOffering> findByCourseIdAndLecturerIdAndSemester(Long courseId, Long lecturerId, String semester);
}