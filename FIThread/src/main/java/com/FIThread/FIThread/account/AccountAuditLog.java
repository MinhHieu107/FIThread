package com.FIThread.FIThread.account;

import com.FIThread.FIThread.common.BaseEntity;
import com.FIThread.FIThread.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "account_audit_logs")
public class AccountAuditLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id", nullable = false)
    private User target;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AccountAction action;

    @Column(length = 500)
    private String reason;

    @Column(name = "batch_id")
    private Long batchId;
}