package com.school.portal.teacher.controller;

import com.school.portal.teacher.dto.DailyAttendanceMarkRequest;
import com.school.portal.teacher.service.TeacherDailyAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/teacher/attendance/daily")
@RequiredArgsConstructor
public class TeacherDailyAttendanceController {

    private final TeacherDailyAttendanceService teacherDailyAttendanceService;

    // ✅ EXISTING (unchanged)
    @PostMapping("/mark")
    public String mark(@RequestBody DailyAttendanceMarkRequest request) {
        return teacherDailyAttendanceService.markDailyAttendance(request);
    }

    // ✅ NEW: Check attendance status (LOCK CHECK)
    @GetMapping("/status")
    public Map<String, Object> status(@RequestParam Integer standard,
                                      @RequestParam String section,
                                      @RequestParam String date) {
        return teacherDailyAttendanceService.checkAttendanceStatus(
                standard, section, LocalDate.parse(date)
        );
    }
}
