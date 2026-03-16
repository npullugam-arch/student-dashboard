package com.school.portal.common.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TeacherTodayScheduleResponse {
    private String date;        // YYYY-MM-DD
    private String dayOfWeek;   // MONDAY
    private List<TeacherTimeTableSlotResponse> slots;
}