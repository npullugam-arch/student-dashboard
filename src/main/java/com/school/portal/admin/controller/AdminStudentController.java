package com.school.portal.admin.controller;

import com.school.portal.admin.dto.CreateStudentRequest;
import com.school.portal.admin.service.AdminStudentService;
import com.school.portal.core.entity.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final AdminStudentService adminStudentService;

    @PostMapping
    public String createStudent(@RequestBody CreateStudentRequest request) {
        return adminStudentService.addStudent(request);
    }

    // ✅ NEW
    @GetMapping
    public List<Student> listStudents() {
        return adminStudentService.getAllStudents();
    }

    // ✅ NEW
    @GetMapping("/{studentId}")
    public Student getStudent(@PathVariable String studentId) {
        return adminStudentService.getStudent(studentId);
    }

    // ✅ NEW
    @PutMapping("/{studentId}")
    public String updateStudent(@PathVariable String studentId,
                                @RequestBody CreateStudentRequest request) {
        return adminStudentService.updateStudent(studentId, request);
    }

    // ✅ NEW
    @DeleteMapping("/{studentId}")
    public String deleteStudent(@PathVariable String studentId) {
        return adminStudentService.deleteStudent(studentId);
    }
}
