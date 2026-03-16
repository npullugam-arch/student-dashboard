package com.school.portal.student.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateLeaveRequest {
    private String studentId;

    private String teacherId;
    private String subjectName;

    private String fromDate; // yyyy-MM-dd
    private String toDate;   // yyyy-MM-dd

    private String purpose;
    private String description;
}
