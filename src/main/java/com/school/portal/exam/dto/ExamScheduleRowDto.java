package com.school.portal.exam.dto;

import lombok.*;

@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamScheduleRowDto {

    private String examName;
    private String subjectName;
    private String examDate;
    private String day;
    private String startTime;
    private String endTime;
}
