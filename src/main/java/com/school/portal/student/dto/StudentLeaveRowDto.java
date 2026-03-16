package com.school.portal.student.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentLeaveRowDto {
    private Long leaveId;
    private String teacherId;
    private String teacherName;
    private String subjectName;

    private String fromDate;
    private String toDate;

    private String purpose;

    private String status; // PENDING/APPROVED/REJECTED
    private String teacherRemark;

    private boolean teacherViewed;
    private String appliedAt;
    private String reviewedAt;
}
