package com.school.portal.common.dto;

import com.school.portal.common.enums.DoubtStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DoubtListRow {
    private Long id;
    private String title;
    private String topic;
    private DoubtStatus status;

    private String studentId;
    private String teacherId;

    private Integer standard;
    private String section;
    private Long standardSubjectId;

    private boolean teacherViewed;
    private boolean studentViewed;

    private LocalDateTime lastMessageAt;
}
