package com.school.portal.office.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateFeeRequest {
    private Long totalFee;
    private Long paidAmount;
    private String nextDueDate; // yyyy-MM-dd or null
    private Boolean hallTicketAllowed;
}
