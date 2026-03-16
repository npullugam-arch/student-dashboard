package com.school.portal.admin.dto;

import lombok.*;

import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TimetableSlotDto {
    private Integer slotOrder;
    private String startTime;
    private String endTime;

    // keys: MONDAY..SATURDAY, value: subject string
    private Map<String, String> subjectsByDay;
}
