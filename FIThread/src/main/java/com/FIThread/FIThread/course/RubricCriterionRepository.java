package com.FIThread.FIThread.course;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RubricCriterionRepository extends JpaRepository<RubricCriterion, Long> {
    List<RubricCriterion> findAllByOrderBySortOrderAsc();
}