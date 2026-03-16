package com.school.portal.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClassSectionRequest {
    private Integer standard;
    private String section;
    private Long standardSubjectId; // ✅ NEW (points to standard_subjects.id)
}
