package com.school.portal.teacher.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TeacherAssignmentDto {
    private Integer standard;
    private String section;
    private String subject;
}
