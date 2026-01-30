package com.school.portal.teacher.controller;

import com.school.portal.teacher.dto.StudentListDto;
import com.school.portal.teacher.dto.TeacherAssignmentDto;
import com.school.portal.teacher.service.TeacherDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher/dashboard")
@RequiredArgsConstructor
public class TeacherDashboardController {

    private final TeacherDashboardService teacherDashboardService;

    // for now: teacherId passed in URL
    // later: we will take teacherId from logged-in user/session
    @GetMapping("/{teacherId}/assignments")
    public List<TeacherAssignmentDto> myAssignments(@PathVariable String teacherId) {
        return teacherDashboardService.getMyAssignments(teacherId);
    }

    @GetMapping("/students")
    public List<StudentListDto> students(@RequestParam Integer standard,
                                         @RequestParam String section) {
        return teacherDashboardService.getStudents(standard, section);
    }
}
