package com.school.portal.admin.repository;

import com.school.portal.core.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(String studentId);

    boolean existsByStudentId(String studentId);

    void deleteByStudentId(String studentId);

    List<Student> findByStandardAndSectionAndActiveTrue(
            Integer standard,
            String section
    );

    List<Student> findByActiveTrueOrderByStandardAscSectionAscFullNameAsc();
}