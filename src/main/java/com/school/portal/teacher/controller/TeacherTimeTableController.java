package com.school.portal.teacher.controller;

import com.school.portal.common.dto.TeacherTodayScheduleResponse;
import com.school.portal.core.service.TeacherTimeTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/teacher")
public class TeacherTimeTableController {

    private final TeacherTimeTableService service;

    @GetMapping("/{teacherId}/timetable/today")
    public TeacherTodayScheduleResponse today(@PathVariable String teacherId) {
        return service.todayForTeacher(teacherId);
    }
}