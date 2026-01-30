package com.school.portal.teacher.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentListDto {
    private String studentId;
    private String fullName;
    private String gender;
    private String parentPhoneNumber;
    private String profileUrl;
    private boolean active;
}
