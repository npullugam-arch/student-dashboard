package com.school.portal.exam.repository;

import com.school.portal.exam.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {

    // Student dashboard
    List<ExamResult> findByExam_IdAndStudent_StudentId(
            Long examId,
            String studentId
    );

    // Teacher loading class results
    List<ExamResult> findByExam_IdAndStudent_StandardAndStudent_Section(
            Long examId,
            Integer standard,
            String section
    );

    // ✅ CRITICAL FIX: find existing result (for update)
    Optional<ExamResult> findByExam_IdAndStudent_IdAndSubjectName(
            Long examId,
            Long studentId,
            String subjectName
    );

}
