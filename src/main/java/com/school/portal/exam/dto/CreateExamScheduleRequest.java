package com.school.portal.exam.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateExamScheduleRequest {

    private Long examId;
    private Integer standard;
    private String section;

    private String subjectName;

    private LocalDate examDate;     // ✅ must be LocalDate
    private String day;

    private LocalTime startTime;    // ✅ must be LocalTime
    private LocalTime endTime;      // ✅ must be LocalTime
}
