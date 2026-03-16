package com.school.portal.teacher.controller;

import com.school.portal.teacher.dto.TeacherProfileDto;
import com.school.portal.teacher.service.TeacherProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/teacher/profile")
@RequiredArgsConstructor
public class TeacherProfileController {

    private final TeacherProfileService teacherProfileService;

    @GetMapping("/{teacherId}")
    public TeacherProfileDto getProfile(@PathVariable String teacherId) {
        return teacherProfileService.getTeacherProfile(teacherId);
    }
}
