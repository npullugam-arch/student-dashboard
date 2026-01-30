package com.school.portal.core.entity;

import com.school.portal.common.enums.Subject;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "attendance",
        uniqueConstraints = {
                // One attendance per student per subject per day
                @UniqueConstraint(columnNames = {"student_id", "subject", "attendance_date"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String studentId;

    @Column(nullable = false, length = 30)
    private String teacherId;

    private Integer standard;

    @Column(length = 5)
    private String section;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Subject subject;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false)
    private boolean present;
}
