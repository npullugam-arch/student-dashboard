package com.school.portal.exam.controller;

import com.school.portal.exam.dto.ExamListRow;
import com.school.portal.exam.dto.ExamScheduleRow;
import com.school.portal.exam.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student/api/exams")
@RequiredArgsConstructor
public class StudentExamController {

    private final ExamService examService;

    @GetMapping
    public List<ExamListRow> listExams() {
        return examService.listExams();
    }

    @GetMapping("/{examId}/timetable")
    public List<ExamScheduleRow> timetable(
            @PathVariable Long examId,
            @RequestParam Integer standard,
            @RequestParam String section
    ) {
        return examService.getTimetable(examId, standard, section);
    }
}
