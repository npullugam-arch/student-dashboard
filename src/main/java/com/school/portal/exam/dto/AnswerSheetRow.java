package com.school.portal.exam.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerSheetRow {
    private Long id;
    private Long examId;

    private Long studentDbId;     // student PK (Long id)
    private String studentId;     // student business id like S1001
    private String studentName;
    private String studentProfileUrl;

    private String subjectName;

    private String originalFileName;
    private String contentType;
    private Long sizeBytes;

    private String uploadedByTeacherId;
    private LocalDateTime uploadedAt;
}
