package com.school.portal.student.controller;

import com.school.portal.common.dto.DiaryRowDto;
import com.school.portal.student.service.StudentDiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student/api/diary")
@RequiredArgsConstructor
public class StudentDiaryController {

    private final StudentDiaryService studentDiaryService;

    @GetMapping("/{studentId}")
    public List<DiaryRowDto> myDiary(@PathVariable String studentId) {
        return studentDiaryService.myDiary(studentId);
    }
}
