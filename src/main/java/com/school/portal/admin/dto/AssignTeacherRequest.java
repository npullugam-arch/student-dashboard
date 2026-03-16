package com.school.portal.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignTeacherRequest {
    private String teacherId;          // T1001
    private Long standardSubjectId;    // from standard_subjects table
    private String section;            // A/B/C
}
