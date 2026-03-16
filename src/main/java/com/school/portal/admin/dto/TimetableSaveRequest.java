package com.school.portal.admin.dto;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TimetableSaveRequest {
    private Integer standard;
    private String section;
    private List<TimetableSlotDto> slots;
}
