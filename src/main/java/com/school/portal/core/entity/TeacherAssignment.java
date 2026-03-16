package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teacher_assignments",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"teacher_id", "standard_subject_id", "section"})
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    // ✅ NEW: admin-defined subject for that standard
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "standard_subject_id", nullable = false)
    private StandardSubject standardSubject;

    @Column(nullable = false, length = 5)
    private String section; // A, B, C

    @Column(nullable = false)
    private Boolean active = true;
}