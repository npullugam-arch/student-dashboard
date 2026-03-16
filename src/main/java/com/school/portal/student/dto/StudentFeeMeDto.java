package com.school.portal.student.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentFeeMeDto {
    private String studentId;
    private String studentName;
    private Integer standard;
    private String section;

    private Long totalFee;
    private Long paidAmount;
    private Long dueAmount;

    private String nextDueDate; // yyyy-MM-dd or null
    private Boolean hallTicketAllowed;

    private String photoUrl;
}
