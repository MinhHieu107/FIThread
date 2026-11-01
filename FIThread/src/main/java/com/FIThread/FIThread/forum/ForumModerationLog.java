package com.FIThread.FIThread.forum;

import com.FIThread.FIThread.common.BaseEntity;
import com.FIThread.FIThread.review.ModerationAction;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "forum_moderation_logs")
public class ForumModerationLog extends BaseEntity {

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ModerationAction action;

    @Column(length = 500)
    private String reason;
}