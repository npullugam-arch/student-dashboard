package com.school.portal.exam.service;

import com.school.portal.admin.repository.StandardSubjectRepository;
import com.school.portal.core.entity.StandardSubject;
import com.school.portal.exam.dto.*;
import com.school.portal.exam.entity.Exam;
import com.school.portal.exam.entity.ExamSchedule;
import com.school.portal.exam.repository.ExamRepository;
import com.school.portal.exam.repository.ExamScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamScheduleRepository examScheduleRepository;
    private final StandardSubjectRepository standardSubjectRepository;

    public Long createExam(CreateExamRequest req) {
        Exam exam = Exam.builder()
                .examName(req.getExamName())
                .createdAt(LocalDateTime.now())
                .build();
        return examRepository.save(exam).getId();
    }

    public String addSchedule(CreateExamScheduleRequest req) {
        Exam exam = examRepository.findById(req.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found: " + req.getExamId()));

        ExamSchedule row = ExamSchedule.builder()
                .exam(exam)
                .standard(req.getStandard())
                .section(req.getSection())
                .subjectName(req.getSubjectName())
                .examDate(req.getExamDate())
                .day(req.getDay())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .build();

        examScheduleRepository.save(row);
        return "✅ Schedule row added";
    }

    public List<ExamListRow> listExams() {
        return examRepository.findAll().stream()
                .sorted(Comparator.comparing(Exam::getCreatedAt).reversed())
                .map(e -> ExamListRow.builder()
                        .id(e.getId())
                        .examName(e.getExamName())
                        .createdAt(e.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public String deleteExam(Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new RuntimeException("Exam not found: " + examId);
        }
        examScheduleRepository.deleteByExam_Id(examId);
        examRepository.deleteById(examId);
        return "✅ Exam deleted from backend";
    }

    public List<ExamScheduleRow> getTimetable(Long examId, Integer standard, String section) {
        return examScheduleRepository
                .findByExam_IdAndStandardAndSectionOrderByExamDateAsc(examId, standard, section)
                .stream()
                .map(s -> ExamScheduleRow.builder()
                        .id(s.getId())
                        .examId(s.getExam().getId())
                        .standard(s.getStandard())
                        .section(s.getSection())
                        .subjectName(s.getSubjectName())
                        .examDate(s.getExamDate())
                        .day(s.getDay())
                        .startTime(s.getStartTime())
                        .endTime(s.getEndTime())
                        .build())
                .toList();
    }

    public List<SubjectRow> getSubjectsForStandard(Integer standard) {
        List<StandardSubject> list = standardSubjectRepository.findByStandardAndActiveTrue(standard);
        return list.stream()
                .map(ss -> SubjectRow.builder()
                        .id(ss.getSubject().getId())
                        .name(ss.getSubject().getName())
                        .build())
                .distinct()
                .toList();
    }

    // ======================================================
    // ✅ NEW: delete ONE schedule row (used by Edit/Delete buttons)
    // ======================================================
    @Transactional
    public String deleteScheduleRow(Long scheduleId) {
        if (!examScheduleRepository.existsById(scheduleId)) {
            throw new RuntimeException("Schedule row not found: " + scheduleId);
        }
        examScheduleRepository.deleteById(scheduleId);
        return "✅ Schedule row deleted";
    }

    // ======================================================
    // ✅ NEW: update ONE schedule row (used by Edit button)
    // ======================================================
    @Transactional
    public String updateScheduleRow(Long scheduleId, UpdateExamScheduleRequest req) {
        ExamSchedule row = examScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule row not found: " + scheduleId));

        // update only fields provided by UI
        row.setSubjectName(req.getSubjectName());
        row.setExamDate(req.getExamDate());
        row.setDay(req.getDay());
        row.setStartTime(req.getStartTime());
        row.setEndTime(req.getEndTime());

        examScheduleRepository.save(row);
        return "✅ Schedule row updated";
    }
}
