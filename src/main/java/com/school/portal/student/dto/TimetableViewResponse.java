package com.school.portal.student.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TimetableViewResponse {
    private Integer standard;
    private String section;

    // fixed days
    private List<String> days; // ["MONDAY","TUESDAY"...]
    private List<Row> rows;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class Row {
        private Integer slotOrder;
        private String startTime;
        private String endTime;
        private Map<String, String> subjectsByDay;
    }
}
