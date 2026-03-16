// -------------------------------------------------
// 7) NEW: Admin Controller
// FILE: src/main/java/com/school/portal/admin/controller/AdminAttendanceController.java
// -------------------------------------------------
package com.school.portal.admin.controller;

import com.school.portal.admin.dto.ResetAttendanceRequest;
import com.school.portal.admin.dto.ResetAttendanceResponse;
import com.school.portal.admin.service.AdminAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/api/attendance")
@RequiredArgsConstructor
public class AdminAttendanceController {

    private final AdminAttendanceService adminAttendanceService;

    // ✅ POST /admin/api/attendance/reset
    @PostMapping("/reset")
    public ResetAttendanceResponse reset(@RequestBody ResetAttendanceRequest request) {
        return adminAttendanceService.resetAttendance(request);
    }
}