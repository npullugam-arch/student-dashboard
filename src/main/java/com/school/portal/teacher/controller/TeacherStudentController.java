package com.school.portal.teacher.controller;

import com.school.portal.admin.repository.StudentRepository;
import com.school.portal.core.entity.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher/api/students")
@RequiredArgsConstructor
public class TeacherStudentController {

    private final StudentRepository studentRepository;


    @GetMapping("/{standard}/{section}")
    public List<Student> getStudents(
            @PathVariable Integer standard,
            @PathVariable String section
    ) {

        return studentRepository
                .findByStandardAndSectionAndActiveTrue(
                        standard,
                        section
                );
    }
}
