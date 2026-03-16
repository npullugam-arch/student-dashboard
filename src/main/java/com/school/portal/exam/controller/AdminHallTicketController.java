package com.school.portal.exam.controller;

import com.school.portal.exam.dto.HallTicketConfigRequest;
import com.school.portal.exam.dto.HallTicketConfigResponse;
import com.school.portal.exam.dto.HallTicketResponse;
import com.school.portal.exam.service.HallTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/api/hallticket")
@RequiredArgsConstructor
public class AdminHallTicketController {

    private final HallTicketService hallTicketService;

    // ✅ Admin sets logo/name/address
    @GetMapping("/config")
    public HallTicketConfigResponse getConfig() {
        return hallTicketService.getConfig();
    }

    @PutMapping("/config")
    public HallTicketConfigResponse saveConfig(@RequestBody HallTicketConfigRequest req) {
        return hallTicketService.saveConfig(req);
    }

    // ✅ Admin can preview/issue hall ticket for any student + exam
    @GetMapping("/issue/{examId}/student/{studentId}")
    public HallTicketResponse issueHallTicket(
            @PathVariable Long examId,
            @PathVariable String studentId
    ) {
        return hallTicketService.getHallTicket(studentId, examId);
    }
}
