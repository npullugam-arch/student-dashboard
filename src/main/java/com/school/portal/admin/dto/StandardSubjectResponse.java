package com.school.portal.admin.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandardSubjectResponse {

    // ✅ mapping id (standard_subjects.id) needed for Remove button
    private Long standardSubjectId;

    private Integer standard;

    private Long subjectId;

    private String subjectName;
}
