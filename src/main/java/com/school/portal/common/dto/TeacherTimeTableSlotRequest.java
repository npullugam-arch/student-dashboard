package com.school.portal.common.dto;

import lombok.Data;

@Data
public class TeacherTimeTableSlotRequest {
    private String dayOfWeek;           // "MONDAY"
    private String startTime;           // "08:00"
    private String endTime;             // "08:45"
    private Integer standard;           // -2..12
    private String section;             // "A"
    private Long standardSubjectId;     // subject mapping id
    private Boolean active;             // optional
}