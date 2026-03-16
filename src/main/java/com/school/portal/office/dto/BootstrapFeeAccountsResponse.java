package com.school.portal.office.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BootstrapFeeAccountsResponse {
    private long totalActiveStudents;
    private long created;
    private long skippedAlreadyExists;
}
