package com.school.portal.student.controller;

import com.school.portal.student.dto.AttendanceDto;
import com.school.portal.student.service.StudentAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student/attendance")
@RequiredArgsConstructor
public class StudentAttendanceController {

    private final StudentAttendanceService studentAttendanceService;

    @GetMapping("/{studentId}")
    public List<AttendanceDto> getMyAttendance(@PathVariable String studentId) {
        return studentAttendanceService.getMyAttendance(studentId);
    }
}
