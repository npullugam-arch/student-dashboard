package com.school.portal.student.service;

import com.school.portal.admin.repository.StandardSubjectRepository;
import com.school.portal.admin.repository.TeacherAssignmentRepository;
import com.school.portal.core.entity.StandardSubject;
import com.school.portal.core.entity.Student;
import com.school.portal.core.entity.TeacherAssignment;
import com.school.portal.core.repository.StudentCoreRepository;
import com.school.portal.student.dto.CourseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentCoursesService {

    private final StudentCoreRepository studentCoreRepository;
    private final StandardSubjectRepository standardSubjectRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

  public List<CourseDto> getMyCourses(String studentId) {

    Student student = studentCoreRepository.findByStudentId(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

    Integer standard = student.getStandard();
    String section = student.getSection(); // ✅ CRITICAL FIX

    // All subjects admin defined for this standard
    List<StandardSubject> standardSubjects =
            standardSubjectRepository.findByStandardAndActiveTrue(standard);

    // Teacher assignments for this student's standard+section
    List<TeacherAssignment> assignments =
            teacherAssignmentRepository.findByStandardSubject_StandardAndSectionAndActiveTrue(
                    standard,
                    section
            );

    // Map by standardSubjectId -> TeacherAssignment
    Map<Long, TeacherAssignment> assignmentMap = new HashMap<>();

    for (TeacherAssignment a : assignments) {
        assignmentMap.put(a.getStandardSubject().getId(), a);
    }

    // Build response
    return standardSubjects.stream()
            .map(ss -> {

                TeacherAssignment a = assignmentMap.get(ss.getId());

                // ❌ OLD constructor missing section
                // ✅ NEW constructor includes section

                if (a == null) {

                    return new CourseDto(
                            ss.getId(),
                            standard,
                            section, // ✅ ADD THIS
                            ss.getSubject().getName(),
                            null,
                            null,
                            null,
                            null,
                            null,
                            false
                    );
                }

                return new CourseDto(
                        ss.getId(),
                        standard,
                        section, // ✅ ADD THIS
                        ss.getSubject().getName(),
                        a.getTeacher().getTeacherId(),
                        a.getTeacher().getFullName(),
                        a.getTeacher().getEmailId(),
                        a.getTeacher().getMobileNumber(),
                        a.getTeacher().getProfileUrl(),
                        true
                );
            })
            .toList();
}


}
