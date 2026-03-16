package com.school.portal.student.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CourseDto {

    private Long standardSubjectId;

    private Integer standard;

    // ✅ ADD THIS (CRITICAL FIX)
    private String section;

    private String subjectName;

    // teacher (optional)
    private String teacherId;
    private String teacherName;
    private String teacherEmail;
    private String teacherMobile;
    private String teacherProfileUrl;

    private Boolean teacherAssigned;
}