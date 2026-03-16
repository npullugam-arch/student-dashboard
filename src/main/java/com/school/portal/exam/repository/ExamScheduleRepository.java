package com.school.portal.exam.repository;

import com.school.portal.exam.entity.ExamSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, Long> {

    List<ExamSchedule> findByExam_IdAndStandardAndSectionOrderByExamDateAsc(
            Long examId, Integer standard, String section
    );

    // ✅ NEW: delete schedules of an exam
    void deleteByExam_Id(Long examId);
}
