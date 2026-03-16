package com.school.portal.office.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeOverviewDto {
    private long totalStudents;
    private long hallTicketBlocked;
    private long totalFee;
    private long totalPaid;
    private long totalDue;
}
