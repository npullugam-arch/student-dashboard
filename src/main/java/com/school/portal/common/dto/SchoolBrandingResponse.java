package com.school.portal.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SchoolBrandingResponse {
    private String schoolName;
    private String logoUrl;
    private LocalDateTime updatedAt;
}