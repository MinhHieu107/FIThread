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
@Table(name = "graduation_requests")
public class GraduationRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "graduation_year", nullable = false)
    private int graduationYear;

    @Column(name = "backup_email", nullable = false)
    private String backupEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GraduationStatus status = GraduationStatus.PENDING;

    @Column(length = 500)
    private String reason;

    @Column(name = "decided_at")
    private Instant decidedAt;
}