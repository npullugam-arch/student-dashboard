package com.school.portal.student.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FacultyDto {
    private String subject;
    private String teacherId;
    private String teacherName;
    private String teacherMobile;
    private String teacherEmail;
    private String profileUrl;
}
