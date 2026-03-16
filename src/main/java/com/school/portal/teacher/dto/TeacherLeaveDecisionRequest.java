package com.school.portal.teacher.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherLeaveDecisionRequest {
    // "APPROVED" or "REJECTED"
    private String status;
    private String remark;
}
