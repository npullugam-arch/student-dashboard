package com.school.portal.office.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeTransactionDto {
    private Long id;

    private String studentId;
    private String studentName;
    private Integer standard;
    private String section;

    private String paidDate; // yyyy-MM-dd
    private Long paidAmount;

    private Long totalFee;
    private Long paidTotalAfter;
    private Long dueAfter;

    private String nextDueDate; // yyyy-MM-dd or null
    private String remarks;

    private String createdBy;
    private String createdAt; // ISO string
}
