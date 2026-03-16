package com.school.portal.admin.controller;

import com.school.portal.common.dto.TeacherTimeTableSlotRequest;
import com.school.portal.common.dto.TeacherTimeTableSlotResponse;
import com.school.portal.core.service.TeacherTimeTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/teachers")
public class AdminTeacherTimeTableController {

    private final TeacherTimeTableService service;

    @GetMapping("/{teacherId}/timetable")
    public List<TeacherTimeTableSlotResponse> list(@PathVariable String teacherId,
                                                   @RequestParam String day) {
        return service.listForTeacherDay(teacherId, day);
    }

    @PostMapping("/{teacherId}/timetable")
    public TeacherTimeTableSlotResponse create(@PathVariable String teacherId,
                                               @RequestBody TeacherTimeTableSlotRequest request) {
        return service.create(teacherId, request);
    }

    @PutMapping("/{teacherId}/timetable/{slotId}")
    public TeacherTimeTableSlotResponse update(@PathVariable String teacherId,
                                               @PathVariable Long slotId,
                                               @RequestBody TeacherTimeTableSlotRequest request) {
        return service.update(teacherId, slotId, request);
    }

    @DeleteMapping("/{teacherId}/timetable/{slotId}")
    public String delete(@PathVariable String teacherId,
                         @PathVariable Long slotId) {
        service.delete(teacherId, slotId);
        return "Deleted";
    }
}