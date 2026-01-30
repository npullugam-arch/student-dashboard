package com.school.portal.admin.controller;

import com.school.portal.admin.dto.CreateStudentRequest;
import com.school.portal.admin.service.AdminStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final AdminStudentService adminStudentService;

    @PostMapping
    public String createStudent(@RequestBody CreateStudentRequest request) {
        return adminStudentService.addStudent(request);
    }
}
