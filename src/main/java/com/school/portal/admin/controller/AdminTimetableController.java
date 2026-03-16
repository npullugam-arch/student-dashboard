package com.school.portal.admin.controller;

import com.school.portal.admin.dto.TimetableSaveRequest;
import com.school.portal.student.dto.TimetableViewResponse;
import com.school.portal.timetable.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/api/timetable")
@RequiredArgsConstructor
public class AdminTimetableController {

    private final TimetableService timetableService;

    @GetMapping("/{standard}/{section}")
    public TimetableViewResponse get(@PathVariable Integer standard, @PathVariable String section) {
        return timetableService.view(standard, section);
    }

    @PostMapping
    public String save(@RequestBody TimetableSaveRequest req) {
        return timetableService.saveOrUpdate(req);
    }
}
