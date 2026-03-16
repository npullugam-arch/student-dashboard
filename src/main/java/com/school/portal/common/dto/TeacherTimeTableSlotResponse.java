package com.school.portal.common.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeacherTimeTableSlotResponse {
    private Long id;
    private String teacherId;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private Integer standard;
    private String section;

    private Long standardSubjectId;
    private String subjectName; // derived
    private boolean active;
}