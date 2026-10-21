package com.FIThread.FIThread.account;

import com.FIThread.FIThread.common.BaseEntity;
import com.FIThread.FIThread.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "graduation_batches")
public class GraduationBatch extends BaseEntity {

    @Column(nullable = false, length = 20)
    private String cohort;

    @Column(name = "graduation_year", nullable = false)
    private int graduationYear;

    @Column(name = "student_count", nullable = false)
    private int studentCount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "reverted_at")
    private Instant revertedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reverted_by")
    private User revertedBy;
}