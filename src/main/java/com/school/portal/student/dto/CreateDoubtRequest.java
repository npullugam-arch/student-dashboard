package com.school.portal.student.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CreateDoubtRequest {
    private String studentId;          // S1001
    private Long standardSubjectId;    // from dropdown
    private String section;            // A/B/C
    private String teacherId;          // selected teacher card
    private String title;
    private String topic;
    private String description;
}
