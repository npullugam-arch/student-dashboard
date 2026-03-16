package com.school.portal.exam.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateExamScheduleRequest {

    private String subjectName;

    private LocalDate examDate;
    private String day;

    private LocalTime startTime;
    private LocalTime endTime;
}
