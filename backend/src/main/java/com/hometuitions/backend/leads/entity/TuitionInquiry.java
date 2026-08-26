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

/** A parent/student request for a tutor, submitted anonymously from the website's
 *  /request-tutor form (and prefilled from the homepage's quick-match redirect). */
@Entity
@Table(name = "tuition_inquiries")
@Getter
@Setter
@NoArgsConstructor
public class TuitionInquiry extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String grade;

    @Column(nullable = false, length = 50)
    private String board;

    /** Comma-joined subject names - matches TutorProfile.subjects' simplicity rather
     *  than introducing a separate child table for a handful of short strings. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String subjects;

    @Column(name = "tuition_mode", nullable = false, length = 20)
    private String tuitionMode;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 100)
    private String timings;

    @Column(length = 50)
    private String frequency;

    @Column(name = "parent_name", nullable = false, length = 150)
    private String parentName;

    @Column(nullable = false, length = 15)
    private String mobile;

    @Column(length = 200)
    private String email;

    @Column(length = 50)
    private String budget;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeadStatus status = LeadStatus.NEW;
}
