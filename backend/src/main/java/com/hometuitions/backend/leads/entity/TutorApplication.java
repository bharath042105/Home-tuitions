package com.hometuitions.backend.leads.entity;

import com.hometuitions.backend.common.util.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A prospective tutor's application, submitted anonymously from the website's
 *  /tutor-registration form, before any user account exists. Document uploads
 *  (photo/Aadhaar/degree/resume) are intentionally not part of this record - the form
 *  only captures filenames client-side today with no upload pipeline behind it. */
@Entity
@Table(name = "tutor_applications")
@Getter
@Setter
@NoArgsConstructor
public class TutorApplication extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "father_name", length = 150)
    private String fatherName;

    @Column(nullable = false, length = 150)
    private String qualification;

    @Column(nullable = false, length = 200)
    private String college;

    @Column(nullable = false, length = 10)
    private String percentage;

    @Column(name = "pass_year", nullable = false, length = 4)
    private String passYear;

    @Column(name = "inter_college", length = 200)
    private String interCollege;

    @Column(name = "inter_percentage", length = 10)
    private String interPercentage;

    @Column(name = "school_name", length = 200)
    private String schoolName;

    @Column(name = "school_percentage", length = 10)
    private String schoolPercentage;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String localities;

    @Column(name = "commute_distance", length = 50)
    private String commuteDistance;

    /** Comma-joined - see TuitionInquiry.subjects for why. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String grades;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String subjects;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String boards;

    @Column(length = 50)
    private String medium;

    @Column(nullable = false, length = 20)
    private String mode;

    @Column(nullable = false, length = 15)
    private String mobile;

    @Column(nullable = false, length = 15)
    private String whatsapp;

    @Column(name = "alternative_phone", length = 15)
    private String alternativePhone;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(length = 50)
    private String occupation;

    @Column(length = 50)
    private String experience;

    @Column(name = "expected_rate", nullable = false, length = 50)
    private String expectedRate;

    @Column(length = 100)
    private String timings;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeadStatus status = LeadStatus.NEW;
}
