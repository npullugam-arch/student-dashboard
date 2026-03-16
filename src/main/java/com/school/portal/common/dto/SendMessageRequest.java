package com.school.portal.common.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SendMessageRequest {
    private String message;
}
