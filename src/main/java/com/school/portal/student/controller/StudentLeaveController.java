package com.school.portal.student.controller;

import com.school.portal.student.dto.CreateLeaveRequest;
import com.school.portal.student.dto.FacultyDto;
import com.school.portal.student.dto.StudentLeaveRowDto;
import com.school.portal.student.service.StudentLeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student/api/leaves")
@RequiredArgsConstructor
public class StudentLeaveController {

    private final StudentLeaveService studentLeaveService;

    @GetMapping("/{studentId}/teachers")
    public List<FacultyDto> myTeachers(@PathVariable String studentId) {
        return studentLeaveService.getMySubjectTeachers(studentId);
    }

    @PostMapping
    public String apply(@RequestBody CreateLeaveRequest request) {
        return studentLeaveService.applyLeave(request);
    }

    @GetMapping("/{studentId}")
    public List<StudentLeaveRowDto> myLeaves(@PathVariable String studentId) {
        return studentLeaveService.getMyLeaves(studentId);
    }

    @GetMapping("/{studentId}/{leaveId}")
    public StudentLeaveRowDto detail(@PathVariable String studentId, @PathVariable Long leaveId) {
        return studentLeaveService.getLeaveDetail(studentId, leaveId);
    }
}
