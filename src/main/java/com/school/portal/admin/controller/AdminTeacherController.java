package com.school.portal.admin.controller;

import com.school.portal.admin.dto.AssignTeacherToCourseRequest;
import com.school.portal.admin.dto.CreateTeacherRequest;
import com.school.portal.admin.service.AdminTeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/teachers")
@RequiredArgsConstructor
public class AdminTeacherController {

    private final AdminTeacherService adminTeacherService;

    // ✅ CREATE
    @PostMapping
    public String createTeacher(@RequestBody CreateTeacherRequest request) {
        return adminTeacherService.addTeacher(request);
    }

    // ✅ LIST
    @GetMapping
    public List<AdminTeacherService.TeacherRow> listTeachers() {
        return adminTeacherService.listTeachers();
    }

    // ✅ GET ONE
    @GetMapping("/{teacherId}")
    public AdminTeacherService.TeacherDetails getTeacher(@PathVariable String teacherId) {
        if (teacherId == null || teacherId.isBlank()) {
            throw new RuntimeException("teacherId is required");
        }
        return adminTeacherService.getTeacherDetails(teacherId);
    }

    // ✅ UPDATE teacher basic info (NOT assignments)
    @PutMapping("/{teacherId}")
    public String updateTeacher(
            @PathVariable String teacherId,
            @RequestBody AdminTeacherService.UpdateTeacherRequest request
    ) {
        if (teacherId == null || teacherId.isBlank()) {
            throw new RuntimeException("teacherId is required");
        }
        return adminTeacherService.updateTeacher(teacherId, request);
    }

    // ✅ DELETE (soft delete)
    @DeleteMapping("/{teacherId}")
    public String deleteTeacher(@PathVariable String teacherId) {
        if (teacherId == null || teacherId.isBlank()) {
            throw new RuntimeException("teacherId is required");
        }
        return adminTeacherService.deactivateTeacher(teacherId);
    }

    // ✅ Assign a course (teacher can have many subjects/classes through assignments)
    @PostMapping("/assign-course")
    public String assignCourse(@RequestBody AssignTeacherToCourseRequest request) {
        return adminTeacherService.assignTeacherToCourse(request);
    }

    // ✅ Assignments for a teacher
    @GetMapping("/{teacherId}/assignments")
    public List<AdminTeacherService.TeacherAssignmentRow> getAssignments(@PathVariable String teacherId) {
        if (teacherId == null || teacherId.isBlank()) {
            throw new RuntimeException("teacherId is required");
        }
        return adminTeacherService.getTeacherAssignments(teacherId);
    }

    // ✅ Remove one assignment row (soft delete)
    @DeleteMapping("/{teacherId}/assignments/{assignmentId}")
    public String deleteAssignment(@PathVariable String teacherId, @PathVariable Long assignmentId) {
        if (teacherId == null || teacherId.isBlank()) {
            throw new RuntimeException("teacherId is required");
        }
        if (assignmentId == null) {
            throw new RuntimeException("assignmentId is required");
        }
        return adminTeacherService.deactivateAssignment(teacherId, assignmentId);
    }
}
