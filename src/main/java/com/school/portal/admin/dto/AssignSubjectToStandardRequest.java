package com.school.portal.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignSubjectToStandardRequest {
    private Integer standard;
    private Long subjectId;
}
