package com.school.portal.exam.service;

import com.school.portal.admin.repository.StudentRepository;
import com.school.portal.core.entity.Student;
import com.school.portal.core.repository.StudentFeeAccountRepository; // ✅ FIX: use CORE repo
import com.school.portal.exam.dto.ExamScheduleRow;
import com.school.portal.exam.dto.HallTicketConfigRequest;
import com.school.portal.exam.dto.HallTicketConfigResponse;
import com.school.portal.exam.dto.HallTicketResponse;
import com.school.portal.exam.entity.HallTicketConfig;
import com.school.portal.exam.repository.ExamRepository;
import com.school.portal.exam.repository.ExamScheduleRepository;
import com.school.portal.exam.repository.HallTicketConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HallTicketService {

    private final HallTicketConfigRepository configRepository;
    private final StudentFeeAccountRepository feeAccountRepository; // ✅ FIX: core repo type
    private final StudentRepository studentRepository;

    private final ExamRepository examRepository;
    private final ExamScheduleRepository examScheduleRepository;

    // --------------------------
    // CONFIG (ADMIN)
    // --------------------------
    public HallTicketConfigResponse getConfig() {
        HallTicketConfig cfg = configRepository.findById(1L)
                .orElse(HallTicketConfig.builder()
                        .id(1L)
                        .logoUrl("")
                        .schoolName("Your School")
                        .address("")
                        .build());

        return HallTicketConfigResponse.builder()
                .logoUrl(cfg.getLogoUrl())
                .schoolName(cfg.getSchoolName())
                .address(cfg.getAddress())
                .build();
    }

    public HallTicketConfigResponse saveConfig(HallTicketConfigRequest req) {
        HallTicketConfig cfg = HallTicketConfig.builder()
                .id(1L)
                .logoUrl(req.getLogoUrl())
                .schoolName(req.getSchoolName())
                .address(req.getAddress())
                .build();

        configRepository.save(cfg);

        return HallTicketConfigResponse.builder()
                .logoUrl(cfg.getLogoUrl())
                .schoolName(cfg.getSchoolName())
                .address(cfg.getAddress())
                .build();
    }

    // --------------------------
    // STUDENT HALL TICKET
    // --------------------------
    public HallTicketResponse getHallTicket(String studentId, Long examId) {

        // ✅ student
        Student stu = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        // ✅ exam
        var exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found: " + examId));

        // ✅ hall ticket allowed (from StudentFeeAccount table)
        boolean allowed = feeAccountRepository.findByStudentId(studentId)
                .map(a -> Boolean.TRUE.equals(a.getHallTicketAllowed()))
                .orElse(false);

        HallTicketConfigResponse cfg = getConfig();

        // ❌ blocked
        if (!allowed) {
            return HallTicketResponse.builder()
                    .allowed(false)
                    .message("Hall ticket is BLOCKED by office. Please clear dues / contact office.")
                    .config(cfg)
                    .rollNumber(stu.getStudentId())
                    .fullName(stu.getFullName())
                    .standard(stu.getStandard())
                    .section(stu.getSection())
                    .fatherName(stu.getFatherName())
                    .profileUrl(stu.getProfileUrl())
                    .examId(exam.getId())
                    .examName(exam.getExamName())
                    .timetable(List.of())
                    .build();
        }

        // ✅ timetable rows
        List<ExamScheduleRow> tt = examScheduleRepository
                .findByExam_IdAndStandardAndSectionOrderByExamDateAsc(
                        examId,
                        stu.getStandard(),
                        stu.getSection()
                )
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

        return HallTicketResponse.builder()
                .allowed(true)
                .message("OK")
                .config(cfg)
                .rollNumber(stu.getStudentId())
                .fullName(stu.getFullName())
                .standard(stu.getStandard())
                .section(stu.getSection())
                .fatherName(stu.getFatherName())
                .profileUrl(stu.getProfileUrl())
                .examId(exam.getId())
                .examName(exam.getExamName())
                .timetable(tt)
                .build();
    }
}
