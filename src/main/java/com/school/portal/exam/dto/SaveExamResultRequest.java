package com.school.portal.exam.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveExamResultRequest {

    private Long examId;

    private Integer standard;

    private String section;

    private String subjectName;

    private Integer totalMarks;

    private List<StudentMark> marks;

    @Getter
    @Setter
    public static class StudentMark {
        private Long studentId;
        private Integer marksObtained;
    }
}
