package com.school.portal.notes.controller;

import com.school.portal.notes.dto.ShortNoteDto;
import com.school.portal.notes.service.StudentShortNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student/api/notes")
@RequiredArgsConstructor
public class StudentShortNoteController {

    private final StudentShortNoteService studentShortNoteService;

    @GetMapping("/my/{studentId}")
    public List<ShortNoteDto> myNotes(@PathVariable String studentId) {
        return studentShortNoteService.myNotes(studentId);
    }
}
