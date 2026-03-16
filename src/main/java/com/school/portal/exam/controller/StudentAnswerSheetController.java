package com.school.portal.exam.controller;

import com.school.portal.exam.dto.AnswerSheetRow;
import com.school.portal.exam.entity.AnswerSheet;
import com.school.portal.exam.service.AnswerSheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/student/api/answer-sheets")
@RequiredArgsConstructor
public class StudentAnswerSheetController {

    private final AnswerSheetService answerSheetService;

    @GetMapping
    public List<AnswerSheetRow> listForStudent(
            @RequestParam String studentId,
            @RequestParam Long examId
    ) {
        return answerSheetService.listForStudent(studentId, examId);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id,
            @RequestParam String studentId
    ) {
        AnswerSheet meta = answerSheetService.getMeta(id);

        // ✅ simple ownership check (student only sees own)
        if (!meta.getStudent().getStudentId().equals(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Resource file = answerSheetService.loadFile(id);
        String filename = URLEncoder.encode(meta.getOriginalFileName(), StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + filename)
                .body(file);
    }
}
