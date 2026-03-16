package com.school.portal.teacher.controller;

import com.school.portal.teacher.dto.TeacherLeaveDecisionRequest;
import com.school.portal.teacher.dto.TeacherLeaveRowDto;
import com.school.portal.teacher.service.TeacherLeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher/api/leaves")
@RequiredArgsConstructor
public class TeacherLeaveController {

    private final TeacherLeaveService teacherLeaveService;

    @GetMapping("/{teacherId}")
    public List<TeacherLeaveRowDto> myRequests(@PathVariable String teacherId) {
        return teacherLeaveService.getMyRequests(teacherId);
    }

    @GetMapping("/{teacherId}/{leaveId}")
    public TeacherLeaveRowDto openOne(@PathVariable String teacherId, @PathVariable Long leaveId) {
        return teacherLeaveService.openOne(teacherId, leaveId);
    }

    @PostMapping("/{teacherId}/{leaveId}/decision")
    public String decide(
            @PathVariable String teacherId,
            @PathVariable Long leaveId,
            @RequestBody TeacherLeaveDecisionRequest req
    ) {
        return teacherLeaveService.decide(teacherId, leaveId, req);
    }
}
