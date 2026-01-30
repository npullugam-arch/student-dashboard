package com.school.portal.teacher.controller;

import com.school.portal.teacher.dto.MarkAttendanceRequest;
import com.school.portal.teacher.service.TeacherAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/teacher/attendance")
@RequiredArgsConstructor
public class TeacherAttendanceController {

    private final TeacherAttendanceService teacherAttendanceService;

    // teacherId passed for now (later from login context)
    @PostMapping("/{teacherId}")
    public String markAttendance(@PathVariable String teacherId,
                                 @RequestBody MarkAttendanceRequest request) {
        return teacherAttendanceService.markAttendance(teacherId, request);
    }
}
