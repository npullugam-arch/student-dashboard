package com.school.portal.exam.controller;

import com.school.portal.exam.dto.AnswerSheetRow;
import com.school.portal.exam.entity.AnswerSheet;
import com.school.portal.exam.service.AnswerSheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/teacher/api/answer-sheets")
@RequiredArgsConstructor
public class TeacherAnswerSheetController {

    private final AnswerSheetService answerSheetService;

    // list sheets for class (teacher view status)
    @GetMapping("/class")
    public List<AnswerSheetRow> listForClass(
            @RequestParam Long examId,
            @RequestParam Integer standard,
            @RequestParam String section
    ) {
        return answerSheetService.listForClass(examId, standard, section);
    }

    // upload/replace
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AnswerSheetRow upload(
            @RequestParam Long examId,
            @RequestParam Long studentDbId,
            @RequestParam String subjectName,
            @RequestParam String teacherId,
            @RequestPart("file") MultipartFile file
    ) {
        return answerSheetService.uploadOrReplace(examId, studentDbId, subjectName, teacherId, file);
    }

    // delete
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        return answerSheetService.delete(id);
    }

    // teacher download/view
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        AnswerSheet meta = answerSheetService.getMeta(id);
        Resource file = answerSheetService.loadFile(id);

        String filename = URLEncoder.encode(meta.getOriginalFileName(), StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + filename)
                .body(file);
    }
}

