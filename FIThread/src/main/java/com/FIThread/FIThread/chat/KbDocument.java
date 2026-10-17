package com.FIThread.FIThread.chat;

import com.FIThread.FIThread.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "kb_documents")
public class KbDocument extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(length = 100)
    private String category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
}