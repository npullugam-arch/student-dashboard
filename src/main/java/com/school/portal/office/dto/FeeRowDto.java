package com.school.portal.office.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeRowDto {
    private String studentId;
    private String studentName;
    private Integer standard;
    private String section;

    private Long totalFee;
    private Long paidAmount;
    private Long dueAmount;

     private String photoUrl; 

    private String nextDueDate; // yyyy-MM-dd or null
    private Boolean hallTicketAllowed;
}
