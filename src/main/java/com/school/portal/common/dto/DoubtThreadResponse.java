package com.school.portal.common.dto;

import com.school.portal.common.enums.DoubtStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DoubtThreadResponse {

    private Long id;
    private String title;
    private String topic;
    private String description;
    private DoubtStatus status;

    private String studentId;
    private String teacherId;
    private Integer standard;
    private String section;
    private Long standardSubjectId;

    private boolean teacherViewed;
    private boolean studentViewed;

    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;

    private List<MessageRow> messages;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MessageRow {
        private Long id;
        private String senderRole;
        private String senderId;
        private String message;
        private LocalDateTime createdAt;
    }
}
