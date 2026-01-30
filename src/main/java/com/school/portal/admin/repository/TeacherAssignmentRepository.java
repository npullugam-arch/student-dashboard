package com.school.portal.admin.repository;

import com.school.portal.core.entity.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {

    List<TeacherAssignment> findByStandardAndSection(Integer standard, String section);

    List<TeacherAssignment> findByTeacher_TeacherId(String teacherId);
}
