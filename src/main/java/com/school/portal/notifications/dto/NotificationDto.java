package com.school.portal.notifications.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Long refId;
    private boolean read;
    private LocalDateTime createdAt;
}
