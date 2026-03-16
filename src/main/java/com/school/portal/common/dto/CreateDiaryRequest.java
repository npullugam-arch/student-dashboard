package com.school.portal.common.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateDiaryRequest {
    private Integer standard;
    private String section;      // "A" / "B"
    private String entryDate;    // yyyy-MM-dd
    private String topic;
    private String workToday;
    private String subjectName;
}
