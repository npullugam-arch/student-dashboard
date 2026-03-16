package com.school.portal.exam.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallTicketResponse {

    private boolean allowed;               // ✅ office controls this
    private String message;                // blocked reason / info

    private HallTicketConfigResponse config;

    private String rollNumber;             // studentId
    private String fullName;
    private Integer standard;
    private String section;
    private String fatherName;
    private String profileUrl;

    private String examName;
    private Long examId;

    private List<ExamScheduleRow> timetable;
}
