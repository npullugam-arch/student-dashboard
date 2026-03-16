package com.school.portal.notice.dto;

import com.school.portal.notice.entity.NoticeAudienceType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
public class NoticeUpdateRequest {

    @NotBlank
    @Size(max = 120)
    private String title;

    @NotBlank
    @Size(max = 5000)
    private String message;

    @NotNull
    private NoticeAudienceType audienceType;

    private Integer classId;

    @Size(max = 10)
    private String section;

    @NotNull
    private LocalDateTime publishAt;

    private LocalDateTime expireAt;

    @NotNull
    private Boolean published;
}