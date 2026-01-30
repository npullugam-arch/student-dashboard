package com.school.portal.admin.controller;

import com.school.portal.admin.dto.CreateTeacherRequest;
import com.school.portal.admin.service.AdminTeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/teachers")
@RequiredArgsConstructor
public class AdminTeacherController {

    private final AdminTeacherService adminTeacherService;

    @PostMapping
    public String createTeacher(@RequestBody CreateTeacherRequest request) {
        return adminTeacherService.addTeacher(request);
    }
}
