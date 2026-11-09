package com.FIThread.FIThread.forum;

import com.FIThread.FIThread.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "forum_images")
public class ForumImage extends BaseEntity {

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(nullable = false, length = 64)
    private String filename;

    @Column(name = "content_type", nullable = false, length = 30)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}