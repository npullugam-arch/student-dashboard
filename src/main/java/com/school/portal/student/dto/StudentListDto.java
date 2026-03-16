package com.school.portal.student.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentListDto {
    private String studentId;
    private String fullName;
    private Integer standard;
    private String section;
    private boolean active;
}
