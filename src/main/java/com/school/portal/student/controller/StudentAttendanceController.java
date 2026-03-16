package com.school.portal.student.controller;

import com.school.portal.student.dto.AttendanceDayDto;
import com.school.portal.student.dto.AttendanceSummaryDto;
import com.school.portal.student.service.StudentAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
public class StudentAttendanceController {

    private final StudentAttendanceService studentAttendanceService;

    @GetMapping("/{studentId}/attendance/summary")
    public AttendanceSummaryDto summary(@PathVariable String studentId) {
        return studentAttendanceService.getSummary(studentId);
    }

    @GetMapping("/{studentId}/attendance")
    public List<AttendanceDayDto> list(
            @PathVariable String studentId,
            @RequestParam String from,
            @RequestParam String to
    ) {
        return studentAttendanceService.getList(studentId, from, to);
    }
}
