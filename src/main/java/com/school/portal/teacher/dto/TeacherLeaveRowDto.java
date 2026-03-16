package com.school.portal.teacher.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherLeaveRowDto {
    private Long leaveId;

    private String studentId;
    private String studentName;
    private Integer standard;
    private String section;

    private String subjectName;

    private String fromDate;
    private String toDate;

    private String purpose;
    private String description;

    private String status;
    private String teacherRemark;

    private boolean teacherViewed;
    private String appliedAt;
    private String reviewedAt;
}
