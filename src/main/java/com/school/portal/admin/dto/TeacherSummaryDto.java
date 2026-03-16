package com.school.portal.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TeacherSummaryDto {
    private String teacherId;
    private String fullName;
    private String mobileNumber;
    private String emailId;
    private boolean active;
}
