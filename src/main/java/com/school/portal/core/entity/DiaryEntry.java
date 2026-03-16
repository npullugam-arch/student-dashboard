package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "diary_entries",
        uniqueConstraints = {
                // ✅ ONE diary per teacher per day per class-section-subject
                @UniqueConstraint(
                        name = "uk_diary_teacher_std_sec_subj_date",
                        columnNames = {"teacher_id", "standard", "section", "subject_name", "entry_date"}
                )
        },
        indexes = {
                @Index(name = "idx_diary_std_sec_date", columnList = "standard, section, entry_date"),
                @Index(name = "idx_diary_teacher", columnList = "teacher_id_fk, entry_date")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DiaryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // teacher FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id_fk", nullable = false)
    private Teacher teacher;

    // convenience copy (for fast display)
    @Column(name = "teacher_id", nullable = false, length = 30)
    private String teacherId;

    @Column(name = "teacher_name", nullable = false, length = 120)
    private String teacherName;

    @Column(nullable = false)
    private Integer standard;

    @Column(nullable = false, length = 5)
    private String section;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(nullable = false, length = 200)
    private String topic;

    @Column(name = "work_today", nullable = false, length = 4000)
    private String workToday;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "subject_name", nullable = false, length = 100)
    private String subjectName;
}