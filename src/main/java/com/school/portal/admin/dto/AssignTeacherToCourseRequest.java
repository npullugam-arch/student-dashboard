package com.school.portal.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignTeacherToCourseRequest {
    private Long standardSubjectId; // ✅ comes from StandardSubject table
    private String section;         // "A"
    private String teacherId;       // "T1001"
}
