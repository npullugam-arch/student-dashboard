package com.school.portal.notes.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortNoteDto {
    private Long id;
    private String teacherId;
    private Integer standard;
    private String section;
    private String title;
    private String topic;
    private String fileUrl;
    private String createdAt; // ISO string
}
