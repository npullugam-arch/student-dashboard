package com.school.portal.student.controller;

import com.school.portal.student.dto.StudentProfileResponse;
import com.school.portal.student.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student/profile")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    @GetMapping("/{studentId}")
    public StudentProfileResponse getProfile(@PathVariable String studentId) {
        return studentProfileService.getProfile(studentId);
    }
}
