package com.FIThread.FIThread.course;

import com.FIThread.FIThread.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "lecturers")
public class Lecturer extends BaseEntity {

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String department;
}