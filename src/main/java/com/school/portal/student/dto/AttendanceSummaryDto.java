package com.school.portal.student.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttendanceSummaryDto {
    private String studentId;
    private long totalDays;
    private long presentDays;
    private long absentDays;
    private int percentage;
}
