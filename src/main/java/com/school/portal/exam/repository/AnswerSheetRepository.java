package com.school.portal.exam.repository;

import com.school.portal.exam.entity.AnswerSheet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnswerSheetRepository extends JpaRepository<AnswerSheet, Long> {

    Optional<AnswerSheet> findByExam_IdAndStudent_IdAndSubjectNameIgnoreCase(
            Long examId, Long studentDbId, String subjectName
    );

    List<AnswerSheet> findByExam_IdAndStudent_StudentIdOrderByUploadedAtDesc(
            Long examId, String studentId
    );

    List<AnswerSheet> findByExam_IdAndStudent_StandardAndStudent_SectionOrderByStudent_FullNameAsc(
            Long examId, Integer standard, String section
    );
}
