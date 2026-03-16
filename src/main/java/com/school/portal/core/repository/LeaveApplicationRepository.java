package com.school.portal.core.repository;

import com.school.portal.core.entity.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {

    List<LeaveApplication> findByStudent_StudentIdOrderByAppliedAtDesc(String studentId);

    List<LeaveApplication> findByTeacher_TeacherIdOrderByAppliedAtDesc(String teacherId);

    Optional<LeaveApplication> findByIdAndTeacher_TeacherId(Long id, String teacherId);

    Optional<LeaveApplication> findByIdAndStudent_StudentId(Long id, String studentId);
}
