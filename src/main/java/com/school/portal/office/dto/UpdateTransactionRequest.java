package com.school.portal.office.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTransactionRequest {

    private String paidDate;     // yyyy-MM-dd
    private Long paidAmount;     // required
    private String nextDueDate;  // yyyy-MM-dd or null
    private String remarks;      // optional
}
