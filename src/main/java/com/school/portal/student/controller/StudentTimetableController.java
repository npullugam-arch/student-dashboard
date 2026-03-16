package com.school.portal.student.controller;

import com.school.portal.student.dto.TimetableViewResponse;
import com.school.portal.timetable.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student/api/timetable")
@RequiredArgsConstructor
public class StudentTimetableController {

    private final TimetableService timetableService;

    @GetMapping("/{standard}/{section}")
    public TimetableViewResponse view(@PathVariable Integer standard, @PathVariable String section) {
        return timetableService.view(standard, section);
    }
}
