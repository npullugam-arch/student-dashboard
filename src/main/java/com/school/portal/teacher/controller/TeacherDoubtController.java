package com.school.portal.teacher.controller;

import com.school.portal.common.dto.DoubtListRow;
import com.school.portal.common.dto.DoubtThreadResponse;
import com.school.portal.common.dto.SendMessageRequest;
import com.school.portal.common.enums.DoubtStatus;
import com.school.portal.teacher.service.TeacherDoubtService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher/api/doubts")
@RequiredArgsConstructor
public class TeacherDoubtController {

    private final TeacherDoubtService teacherDoubtService;

    @GetMapping("/my/{teacherId}")
    public List<DoubtListRow> myDoubts(
            @PathVariable String teacherId,
            @RequestParam(required = false) DoubtStatus status
    ) {
        return teacherDoubtService.listTeacherDoubts(teacherId, status);
    }

    @GetMapping("/{doubtId}/teacher/{teacherId}")
    public DoubtThreadResponse thread(@PathVariable Long doubtId, @PathVariable String teacherId) {
        return teacherDoubtService.getThreadAsTeacher(doubtId, teacherId);
    }

    @PostMapping("/{doubtId}/teacher/{teacherId}/messages")
    public String reply(@PathVariable Long doubtId, @PathVariable String teacherId, @RequestBody SendMessageRequest req) {
        return teacherDoubtService.sendMessageAsTeacher(doubtId, teacherId, req);
    }

    @PutMapping("/{doubtId}/teacher/{teacherId}/status")
    public String status(@PathVariable Long doubtId, @PathVariable String teacherId, @RequestParam DoubtStatus status) {
        return teacherDoubtService.updateStatus(doubtId, teacherId, status);
    }
}