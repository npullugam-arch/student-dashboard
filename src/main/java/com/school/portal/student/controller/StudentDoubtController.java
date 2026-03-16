package com.school.portal.student.controller;

import com.school.portal.common.dto.DoubtListRow;
import com.school.portal.common.dto.DoubtThreadResponse;
import com.school.portal.common.dto.SendMessageRequest;
import com.school.portal.common.enums.DoubtStatus;
import com.school.portal.student.dto.CreateDoubtRequest;
import com.school.portal.student.dto.TeacherCardDto;
import com.school.portal.student.service.StudentDoubtService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student/api/doubts")
@RequiredArgsConstructor
public class StudentDoubtController {

    private final StudentDoubtService studentDoubtService;

    @GetMapping("/assigned-teachers/{studentId}")
    public List<TeacherCardDto> assignedTeachers(@PathVariable String studentId) {
        return studentDoubtService.getAssignedTeachers(studentId);
    }

    @PostMapping
    public String create(@RequestBody CreateDoubtRequest req) {
        return studentDoubtService.createDoubt(req);
    }

    @GetMapping("/my/{studentId}")
    public List<DoubtListRow> myDoubts(
            @PathVariable String studentId,
            @RequestParam(required = false) DoubtStatus status
    ) {
        return studentDoubtService.listMyDoubts(studentId, status);
    }

    @GetMapping("/{doubtId}/student/{studentId}")
    public DoubtThreadResponse thread(@PathVariable Long doubtId, @PathVariable String studentId) {
        return studentDoubtService.getThreadAsStudent(doubtId, studentId);
    }

    @PostMapping("/{doubtId}/student/{studentId}/messages")
    public String sendMessage(@PathVariable Long doubtId, @PathVariable String studentId, @RequestBody SendMessageRequest req) {
        return studentDoubtService.sendMessageAsStudent(doubtId, studentId, req);
    }
}