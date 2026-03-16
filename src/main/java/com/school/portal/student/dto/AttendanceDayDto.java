package com.school.portal.student.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttendanceDayDto {
    private String date;   // YYYY-MM-DD
    private String status; // PRESENT / ABSENT
}
