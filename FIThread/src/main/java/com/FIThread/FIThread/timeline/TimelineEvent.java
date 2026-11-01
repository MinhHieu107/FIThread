package com.FIThread.FIThread.timeline;

import com.FIThread.FIThread.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "timeline_events")
public class TimelineEvent extends BaseEntity {

    @Column(name = "event_year", nullable = false)
    private int eventYear;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;
}