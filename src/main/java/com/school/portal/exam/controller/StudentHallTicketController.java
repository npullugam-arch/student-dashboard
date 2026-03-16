package com.school.portal.exam.controller;

import com.school.portal.exam.dto.HallTicketResponse;
import com.school.portal.exam.service.HallTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student/api/hallticket")
@RequiredArgsConstructor
public class StudentHallTicketController {

    private final HallTicketService hallTicketService;

    @GetMapping("/{examId}/student/{studentId}")
    public HallTicketResponse hallTicket(
            @PathVariable Long examId,
            @PathVariable String studentId
    ) {
        return hallTicketService.getHallTicket(studentId, examId);
    }
}
