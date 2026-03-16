package com.school.portal.teacher.service;

import com.school.portal.admin.repository.TeacherAssignmentRepository;
import com.school.portal.core.entity.Student;
import com.school.portal.core.entity.TeacherAssignment;
import com.school.portal.core.repository.StudentCoreRepository;
import com.school.portal.teacher.dto.StudentListDto;
import com.school.portal.teacher.dto.TeacherAssignmentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherDashboardService {

    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StudentCoreRepository studentCoreRepository;

    public List<TeacherAssignmentDto> getMyAssignments(String teacherId) {

        List<TeacherAssignment> assignments =
                teacherAssignmentRepository.findByTeacher_TeacherIdAndActiveTrue(teacherId);

        return assignments.stream()
                .map(a -> new TeacherAssignmentDto(
                        // ✅ standard now comes from standardSubject
                        a.getStandardSubject().getStandard(),
                        a.getSection(),
                        // ✅ subject name now comes from DB subject entity
                        a.getStandardSubject().getSubject().getName()
                ))
                .toList();
    }

    public List<StudentListDto> getStudents(Integer standard, String section) {

        List<Student> students = studentCoreRepository.findByStandardAndSection(standard, section);

        return students.stream()
                .map(s -> new StudentListDto(
                        s.getStudentId(),
                        s.getFullName(),
                        s.getGender(),
                        s.getParentPhoneNumber(),
                        s.getProfileUrl(),
                        s.isActive()
                ))
                .toList();
    }
}
