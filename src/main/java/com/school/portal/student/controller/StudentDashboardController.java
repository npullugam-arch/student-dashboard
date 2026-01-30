package com.school.portal.student.controller;

import com.school.portal.student.dto.FacultyDto;
import com.school.portal.student.service.StudentDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student/dashboard")
@RequiredArgsConstructor
public class StudentDashboardController {

    private final StudentDashboardService studentDashboardService;

    // for now: pass studentId directly (later we take from login token/session)
    @GetMapping("/{studentId}/faculties")
    public List<FacultyDto> getFaculties(@PathVariable String studentId) {
        return studentDashboardService.getMyFaculties(studentId);
    }
}
