package com.school.portal.student.controller;

import com.school.portal.student.dto.CourseDto;
import com.school.portal.student.service.StudentCoursesService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
public class StudentCoursesController {

    private final StudentCoursesService studentCoursesService;

    @GetMapping("/{studentId}/courses")
    public List<CourseDto> getMyCourses(@PathVariable String studentId) {
        return studentCoursesService.getMyCourses(studentId);
    }
}
