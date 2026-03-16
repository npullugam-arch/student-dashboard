package com.school.portal.exam.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamScheduleRow {
    private Long id;
    private Long examId;
    private Integer standard;
    private String section;
    private String subjectName;
    private LocalDate examDate;
    private String day;
    private LocalTime startTime;
    private LocalTime endTime;
}
