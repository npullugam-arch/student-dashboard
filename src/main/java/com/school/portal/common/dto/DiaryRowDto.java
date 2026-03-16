package com.school.portal.common.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DiaryRowDto {
    private Long id;

    private String teacherId;
    private String teacherName;

    private Integer standard;
    private String section;
    private String subjectName;
    private String entryDate;   // yyyy-MM-dd
    private String topic;
    private String workToday;

    private String createdAt;
}
