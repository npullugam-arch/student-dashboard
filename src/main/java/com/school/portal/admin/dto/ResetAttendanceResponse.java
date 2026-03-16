// -------------------------------------------------
// 5) NEW: Admin DTO (Response)
// FILE: src/main/java/com/school/portal/admin/dto/ResetAttendanceResponse.java
// -------------------------------------------------
package com.school.portal.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResetAttendanceResponse {
    private Integer standard;
    private String section;

    private long deletedDailyAttendance;
    private long deletedAttendanceSessions;
    private long deletedSubjectAttendance;

    private String message;
}