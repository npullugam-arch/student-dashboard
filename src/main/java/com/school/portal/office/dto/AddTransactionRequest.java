package com.school.portal.office.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddTransactionRequest {
    private Long paidAmount;     // required
    private String paidDate;     // yyyy-MM-dd (optional -> today)
    private String nextDueDate;  // yyyy-MM-dd or null
    private String remarks;      // optional
}
