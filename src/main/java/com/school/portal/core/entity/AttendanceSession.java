package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "attendance_sessions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"standard", "section", "attendance_date"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer standard;

    private String section;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    // who marked
    @Column(nullable = false)
    private String teacherId;

    private LocalDateTime createdAt;
}
