package com.school.portal.student.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TeacherCardDto {
    private String teacherId;
    private String teacherName;
    private String profileUrl;

    private Integer standard;
    private String section;

    private Long standardSubjectId;
    private String subjectName;
}
