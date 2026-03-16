package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(
        name = "teacher_timetable_slots",
        indexes = {
                @Index(name = "idx_tts_teacher_day", columnList = "teacherId, dayOfWeek"),
                @Index(name = "idx_tts_std_sec_day", columnList = "standard, section, dayOfWeek")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TeacherTimeTableSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String teacherId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private DayOfWeek dayOfWeek;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    // supports -2..12 like your system
    @Column(nullable = false)
    private Integer standard;

    @Column(nullable = false, length = 5)
    private String section;

    // subject mapped for that standard
    @Column(nullable = false)
    private Long standardSubjectId;

    @Column(nullable = false)
    private boolean active = true;
}