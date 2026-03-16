package com.school.portal.teacher.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class DailyAttendanceMarkRequest {
    private String teacherId;    // T1001
    private Integer standard;    // 7
    private String section;      // A
    private String date;         // "2026-02-01"

    // studentId -> true/false
    // true = present, false = absent
    private Map<String, Boolean> attendance;
}
