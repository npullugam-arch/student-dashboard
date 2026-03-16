package com.school.portal.teacher.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MarkAttendanceRequest {

    private Integer standard;
    private String section;
    private String subject; // MATHS
    private String attendanceDate; // YYYY-MM-DD
    
    private List<StudentAttendanceRequest> students;
}
