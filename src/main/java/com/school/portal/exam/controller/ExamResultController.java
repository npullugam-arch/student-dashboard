package com.school.portal.exam.controller;

import com.school.portal.exam.dto.ExamResultRow;
import com.school.portal.exam.dto.SaveExamResultRequest;
import com.school.portal.exam.service.ExamResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ExamResultController {

    private final ExamResultService examResultService;

    // Teacher save results
    @PostMapping("/teacher/api/exam-results")
    public String save(@RequestBody SaveExamResultRequest req) {
        return examResultService.saveResults(req);
    }

    @GetMapping("/teacher/api/exam-results/{examId}/{standard}/{section}/{subject}")
public List<ExamResultRow> getForTeacher(
        @PathVariable Long examId,
        @PathVariable Integer standard,
        @PathVariable String section,
        @PathVariable String subject
) {
    return examResultService.getResultsForClassSubject(
            examId,
            standard,
            section,
            subject
    );
}


    // Student view results
    @GetMapping("/student/api/exam-results/{examId}/{studentId}")
    public List<ExamResultRow> getStudent(
            @PathVariable Long examId,
            @PathVariable String studentId
    ) {
        return examResultService.getStudentResults(examId, studentId);
    }
}
