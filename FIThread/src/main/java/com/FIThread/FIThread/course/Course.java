package com.FIThread.FIThread.course;

import com.FIThread.FIThread.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "courses")
public class Course extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int credits = 3;

    private String specialization;

    @Column(name = "is_required", nullable = false)
    private boolean required = false;

    @Column(columnDefinition = "TEXT")
    private String description;
}