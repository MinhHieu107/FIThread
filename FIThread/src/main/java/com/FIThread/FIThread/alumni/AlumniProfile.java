package com.FIThread.FIThread.alumni;

import com.FIThread.FIThread.common.BaseEntity;
import com.FIThread.FIThread.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "alumni_profiles")
public class AlumniProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "graduation_year", nullable = false)
    private int graduationYear;

    private String company;

    @Column(name = "position_title")
    private String positionTitle;

    @Column(length = 100)
    private String industry;

    @Column(length = 1000)
    private String bio;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "contact_visible", nullable = false)
    private boolean contactVisible = false;

    @Column(name = "card_photo_path")
    private String cardPhotoPath;
}