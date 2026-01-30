package com.school.portal.student.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttendanceDto {
    private String date;      // 2026-01-29
    private String subject;   // MATHS
    private boolean present;  // true/false
    private String teacherId; // T1001
}
