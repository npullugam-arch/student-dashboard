package com.school.portal.core.repository;

import com.school.portal.core.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentCoreRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentId(String studentId);
    List<Student> findByStandardAndSection(Integer standard, String section);
}
