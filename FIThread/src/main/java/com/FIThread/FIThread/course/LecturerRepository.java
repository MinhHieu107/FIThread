// course/LecturerRepository.java
package com.FIThread.FIThread.course;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LecturerRepository extends JpaRepository<Lecturer, Long> {
    Optional<Lecturer> findByFullName(String fullName);
}