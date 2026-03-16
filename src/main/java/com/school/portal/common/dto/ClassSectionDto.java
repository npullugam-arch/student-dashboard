package com.school.portal.common.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ClassSectionDto {
    private Integer standard;
    private String section;
}
