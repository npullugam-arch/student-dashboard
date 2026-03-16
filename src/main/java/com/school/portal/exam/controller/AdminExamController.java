package com.school.portal.exam.controller;

import com.school.portal.exam.dto.*;
import com.school.portal.exam.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/api/exams")
@RequiredArgsConstructor
public class AdminExamController {

    private final ExamService examService;

    @PostMapping
    public Long createExam(@RequestBody CreateExamRequest req) {
        return examService.createExam(req);
    }

    @PostMapping("/schedule")
    public String addSchedule(@RequestBody CreateExamScheduleRequest req) {
        return examService.addSchedule(req);
    }

    // ✅ list created exams
    @GetMapping
    public List<ExamListRow> listExams() {
        return examService.listExams();
    }

    // ✅ delete exam (also deletes schedules)
    @DeleteMapping("/{examId}")
    public String deleteExam(@PathVariable Long examId) {
        return examService.deleteExam(examId);
    }

    // ✅ NEW: delete ONE schedule row by scheduleId
    @DeleteMapping("/schedule/{scheduleId}")
    public String deleteSchedule(@PathVariable Long scheduleId) {
        return examService.deleteScheduleRow(scheduleId);
    }

    // ✅ NEW: update ONE schedule row by scheduleId
    @PutMapping("/schedule/{scheduleId}")
    public String updateSchedule(
            @PathVariable Long scheduleId,
            @RequestBody UpdateExamScheduleRequest req
    ) {
        return examService.updateScheduleRow(scheduleId, req);
    }
}
