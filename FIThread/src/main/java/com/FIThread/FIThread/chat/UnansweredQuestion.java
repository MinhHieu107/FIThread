package com.FIThread.FIThread.chat;

import com.FIThread.FIThread.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "unanswered_questions")
public class UnansweredQuestion extends BaseEntity {

    @Column(nullable = false, length = 500)
    private String question;

    @Column(nullable = false)
    private boolean resolved = false;
}