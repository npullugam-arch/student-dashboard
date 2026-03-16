package com.school.portal.exam.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamListRow {
    private Long id;
    private String examName;
    private LocalDateTime createdAt;
}
