package com.school.portal.core.entity;

import com.school.portal.common.enums.LeaveStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ✅ IMPORTANT:
     * Your DB has BOTH student_id and student_id_fk as NOT NULL.
     * So we map:
     * - student association -> student_id_fk
     * - extra raw fk column -> student_id
     */

    // maps to student_id_fk
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id_fk", nullable = false)
    private Student student;

    // maps to teacher_id_fk
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id_fk", nullable = false)
    private Teacher teacher;

    // ✅ ALSO fill legacy FK columns (student_id, teacher_id) because DB requires them
    @Column(name = "student_id", nullable = false)
    private Long studentIdLegacy;

    @Column(name = "teacher_id", nullable = false)
    private Long teacherIdLegacy;

    @Column(nullable = false, length = 80)
    private String subjectName;

    @Column(nullable = false)
    private Integer standard;

    @Column(nullable = false, length = 5)
    private String section;

    @Column(nullable = false)
    private LocalDate fromDate;

    @Column(nullable = false)
    private LocalDate toDate;

    @Column(nullable = false, length = 120)
    private String purpose;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeaveStatus status;

    @Column(length = 1000)
    private String teacherRemark;

    @Column(nullable = false)
    private Boolean teacherViewed = false;

    @Column(nullable = false)
    private LocalDateTime appliedAt;

    private LocalDateTime reviewedAt;
}
