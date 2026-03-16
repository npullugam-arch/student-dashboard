// -------------------------------------------------
// 4) NEW: Admin DTO (Request)
// FILE: src/main/java/com/school/portal/admin/dto/ResetAttendanceRequest.java
// -------------------------------------------------
package com.school.portal.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetAttendanceRequest {
    private Integer standard;     // class
    private String section;       // section
    private String confirmText;   // must be "RESET"
}