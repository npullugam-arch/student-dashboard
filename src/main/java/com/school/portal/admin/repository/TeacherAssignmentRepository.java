package com.school.portal.admin.repository;

import com.school.portal.core.entity.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {

    List<TeacherAssignment> findByTeacher_TeacherIdAndActiveTrue(String teacherId);

    // ✅ NEW (needed for deactivateTeacher)
    List<TeacherAssignment> findByTeacher_TeacherId(String teacherId);

    List<TeacherAssignment> findByStandardSubject_StandardAndSectionAndActiveTrue(Integer standard, String section);

    Optional<TeacherAssignment> findByStandardSubject_IdAndSection(Long standardSubjectId, String section);

    // ADD THIS METHOD ONLY (do not remove existing)
    Optional<TeacherAssignment> findByStandardSubject_IdAndSectionAndActiveTrue(Long standardSubjectId, String section);
}