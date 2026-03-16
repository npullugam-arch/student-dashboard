package com.school.portal.exam.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallTicketConfigResponse {
    private String logoUrl;
    private String schoolName;
    private String address;
}
