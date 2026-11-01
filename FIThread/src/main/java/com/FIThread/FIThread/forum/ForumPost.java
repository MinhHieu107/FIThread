package com.FIThread.FIThread.forum;

import com.FIThread.FIThread.common.BaseEntity;
import com.FIThread.FIThread.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "forum_posts")
public class ForumPost extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "root_id")
    private Long rootId;

    @Column(nullable = false, length = 500)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ForumPostStatus status = ForumPostStatus.PUBLISHED;

    @Column(name = "edited_at")
    private Instant editedAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "forum_post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag", length = 50)
    private Set<String> tags = new LinkedHashSet<>();
}