package com.school.portal.notice.dto;

import com.school.portal.notice.entity.NoticeAudienceType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NoticeResponse {
    private Long id;
    private String title;
    private String message;
    private NoticeAudienceType audienceType;
    private Integer classId;
    private String section;
    private LocalDateTime publishAt;
    private LocalDateTime expireAt;
    private boolean published;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}