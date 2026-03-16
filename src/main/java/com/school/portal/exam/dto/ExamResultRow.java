package com.school.portal.exam.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResultRow {

    private Long studentId;

    private String subjectName;

    private Integer marksObtained;

    private Integer totalMarks;
}

