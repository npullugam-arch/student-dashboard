package com.school.portal.student.service;

import com.school.portal.admin.repository.TeacherAssignmentRepository;
import com.school.portal.core.entity.Student;
import com.school.portal.core.entity.TeacherAssignment;
import com.school.portal.core.repository.StudentCoreRepository;
import com.school.portal.student.dto.FacultyDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentDashboardService {

    private final StudentCoreRepository studentCoreRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public List<FacultyDto> getMyFaculties(String studentId) {

        Student student = studentCoreRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        // ✅ NEW repository method (standardSubject.standard)
        List<TeacherAssignment> assignments =
                teacherAssignmentRepository.findByStandardSubject_StandardAndSectionAndActiveTrue(
                        student.getStandard(),
                        student.getSection()
                );

        return assignments.stream()
                .map(a -> new FacultyDto(
                        // ✅ subject from DB
                        a.getStandardSubject().getSubject().getName(),
                        a.getTeacher().getTeacherId(),
                        a.getTeacher().getFullName(),
                        a.getTeacher().getMobileNumber(),
                        a.getTeacher().getEmailId(),
                        a.getTeacher().getProfileUrl()
                ))
                .toList();
    }
}
