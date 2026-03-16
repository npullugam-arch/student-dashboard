package com.school.portal.exam.controller;

import com.school.portal.exam.dto.SubjectRow;
import com.school.portal.exam.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/api/exam-subjects")
@RequiredArgsConstructor
public class AdminExamSubjectController {

    private final ExamService examService;

    @GetMapping
    public List<SubjectRow> subjects(@RequestParam Integer standard) {
        return examService.getSubjectsForStandard(standard);
    }
}
