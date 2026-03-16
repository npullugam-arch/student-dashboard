package com.school.portal.notes.controller;

import com.school.portal.notes.dto.ShortNoteDto;
import com.school.portal.notes.service.TeacherShortNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/teacher/api/notes")
@RequiredArgsConstructor
public class TeacherShortNoteController {

    private final TeacherShortNoteService teacherShortNoteService;

    // Upload PDF note (multipart)
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ShortNoteDto upload(
            @RequestParam String teacherId,
            @RequestParam Integer standard,
            @RequestParam String section,
            @RequestParam String title,
            @RequestParam(required = false) String topic,
            @RequestPart("pdf") MultipartFile pdf
    ) {
        return teacherShortNoteService.upload(teacherId, standard, section, title, topic, pdf);
    }

    // List my uploaded notes
    @GetMapping("/my/{teacherId}")
    public List<ShortNoteDto> myNotes(@PathVariable String teacherId) {
        return teacherShortNoteService.myNotes(teacherId);
    }

    // Soft delete
    @DeleteMapping("/my/{teacherId}/{noteId}")
    public String delete(@PathVariable String teacherId, @PathVariable Long noteId) {
        return teacherShortNoteService.deleteMyNote(teacherId, noteId);
    }
}
