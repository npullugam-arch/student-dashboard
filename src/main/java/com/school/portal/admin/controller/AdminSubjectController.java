package com.school.portal.admin.controller;

import com.school.portal.admin.dto.AssignSubjectToStandardRequest;
import com.school.portal.admin.dto.CreateSubjectRequest;
import com.school.portal.admin.dto.StandardSubjectResponse;
import com.school.portal.admin.service.AdminSubjectService;
import com.school.portal.core.entity.StandardSubject;
import com.school.portal.core.entity.SubjectEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/subjects")
@RequiredArgsConstructor
public class AdminSubjectController {

    private final AdminSubjectService adminSubjectService;

    @PostMapping
    public SubjectEntity createSubject(@RequestBody CreateSubjectRequest request) {
        return adminSubjectService.createSubject(request);
    }

    @PostMapping("/assign")
    public StandardSubject assignToStandard(@RequestBody AssignSubjectToStandardRequest request) {
        return adminSubjectService.assignToStandard(request);
    }

    @GetMapping("/standard/{standard}")
    public List<StandardSubjectResponse> getSubjectsForStandard(@PathVariable Integer standard) {
        return adminSubjectService.getSubjectsForStandard(standard);
    }

    @DeleteMapping("/standard-subject/{standardSubjectId}")
    public String removeFromStandard(@PathVariable Long standardSubjectId) {
        adminSubjectService.removeFromStandard(standardSubjectId);
        return "Removed from class successfully";
    }

    // ✅ NEW
    @GetMapping("/all")
    public List<SubjectEntity> getAllSubjects() {
        return adminSubjectService.getAllSubjects();
    }
}
