package com.school.portal.teacher.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentAttendanceRequest {
    private String studentId;
    private boolean present;
}
