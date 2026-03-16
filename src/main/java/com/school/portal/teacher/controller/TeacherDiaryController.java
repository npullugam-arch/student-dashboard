package com.school.portal.teacher.controller;

import com.school.portal.common.dto.ClassSectionDto;
import com.school.portal.common.dto.CreateDiaryRequest;
import com.school.portal.common.dto.DiaryRowDto;
import com.school.portal.common.dto.UpdateDiaryRequest;
import com.school.portal.teacher.service.TeacherDiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher/api/diary")
@RequiredArgsConstructor
public class TeacherDiaryController {

    private final TeacherDiaryService teacherDiaryService;

    @GetMapping("/{teacherId}/classes")
    public List<ClassSectionDto> myClasses(@PathVariable String teacherId) {
        return teacherDiaryService.myClasses(teacherId);
    }

    // ✅ list (supports optional subjectName)
    @GetMapping("/{teacherId}")
    public List<DiaryRowDto> myEntries(
            @PathVariable String teacherId,
            @RequestParam Integer standard,
            @RequestParam String section,
            @RequestParam(required = false) String subjectName
    ) {
        return teacherDiaryService.myEntries(teacherId, standard, section, subjectName);
    }

    // ✅ ONE diary for a specific date
    @GetMapping("/{teacherId}/one")
    public DiaryRowDto oneForDate(
            @PathVariable String teacherId,
            @RequestParam Integer standard,
            @RequestParam String section,
            @RequestParam String subjectName,
            @RequestParam String date
    ) {
        return teacherDiaryService.oneForDate(teacherId, standard, section, subjectName, date);
    }

    @PostMapping("/{teacherId}")
    public String create(@PathVariable String teacherId, @RequestBody CreateDiaryRequest req) {
        return teacherDiaryService.create(teacherId, req);
    }

    // ✅ UPDATE (preferred REST)
    @PutMapping("/{teacherId}/{id}")
    public String update(
            @PathVariable String teacherId,
            @PathVariable Long id,
            @RequestBody UpdateDiaryRequest req
    ) {
        return teacherDiaryService.update(teacherId, id, req);
    }

    // ✅ UPDATE fallback (so frontend can call postJson)
    @PostMapping("/{teacherId}/{id}")
    public String updateViaPost(
            @PathVariable String teacherId,
            @PathVariable Long id,
            @RequestBody UpdateDiaryRequest req
    ) {
        return teacherDiaryService.update(teacherId, id, req);
    }

    // ✅ DELETE (preferred REST)
    @DeleteMapping("/{teacherId}/{id}")
    public String delete(
            @PathVariable String teacherId,
            @PathVariable Long id
    ) {
        return teacherDiaryService.delete(teacherId, id);
    }

    // ✅ DELETE fallback (so frontend can call postJson)
    @PostMapping("/{teacherId}/{id}/delete")
    public String deleteViaPost(
            @PathVariable String teacherId,
            @PathVariable Long id
    ) {
        return teacherDiaryService.delete(teacherId, id);
    }
}