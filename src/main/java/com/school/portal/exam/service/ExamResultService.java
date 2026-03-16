package com.school.portal.exam.service;

import com.school.portal.admin.repository.StudentRepository;
import com.school.portal.exam.dto.ExamResultRow;
import com.school.portal.exam.dto.SaveExamResultRequest;
import com.school.portal.exam.entity.Exam;
import com.school.portal.exam.entity.ExamResult;
import com.school.portal.exam.repository.ExamRepository;
import com.school.portal.exam.repository.ExamResultRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamResultService {

    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final ExamResultRepository examResultRepository;


    /*
     * ============================
     * SAVE OR UPDATE RESULTS
     * FIXED VERSION (NO DELETE)
     * ============================
     */
    @Transactional
    public String saveResults(SaveExamResultRequest req) {

        Exam exam = examRepository.findById(req.getExamId())
                .orElseThrow(() ->
                        new RuntimeException("Exam not found: " + req.getExamId())
                );

        req.getMarks().forEach(m -> {

            var student = studentRepository.findById(m.getStudentId())
                    .orElseThrow(() ->
                            new RuntimeException("Student not found: " + m.getStudentId())
                    );

            // ✅ FIND existing result
            var existing =
                    examResultRepository
                            .findByExam_IdAndStudent_IdAndSubjectName(
                                    exam.getId(),
                                    student.getId(),
                                    req.getSubjectName()
                            );

            if(existing.isPresent()) {

                // ✅ UPDATE existing result
                ExamResult result = existing.get();

                result.setMarksObtained(m.getMarksObtained());
                result.setTotalMarks(req.getTotalMarks());
                result.setCreatedAt(LocalDateTime.now());

                examResultRepository.save(result);

            }
            else {

                // ✅ INSERT new result
                ExamResult result =
                        ExamResult.builder()
                                .exam(exam)
                                .student(student)
                                .subjectName(req.getSubjectName())
                                .marksObtained(m.getMarksObtained())
                                .totalMarks(req.getTotalMarks())
                                .createdAt(LocalDateTime.now())
                                .build();

                examResultRepository.save(result);

            }

        });

        return "Results saved successfully";
    }


    /*
     * ============================
     * STUDENT VIEW RESULTS
     * ============================
     */
    public List<ExamResultRow> getStudentResults(
            Long examId,
            String studentId
    ) {

        return examResultRepository
                .findByExam_IdAndStudent_StudentId(examId, studentId)
                .stream()
                .map(r ->
                        ExamResultRow.builder()
                                .studentId(r.getStudent().getId())
                                .subjectName(r.getSubjectName())
                                .marksObtained(r.getMarksObtained())
                                .totalMarks(r.getTotalMarks())
                                .build()
                )
                .toList();
    }


    /*
     * ============================
     * TEACHER LOAD EXISTING MARKS
     * ============================
     */
    public List<ExamResultRow> getResultsForClassSubject(
            Long examId,
            Integer standard,
            String section,
            String subjectName
    ) {

        return examResultRepository
                .findByExam_IdAndStudent_StandardAndStudent_Section(
                        examId,
                        standard,
                        section
                )
                .stream()
                .filter(r ->
                        r.getSubjectName().equalsIgnoreCase(subjectName)
                )
                .map(r ->
                        ExamResultRow.builder()
                                .studentId(r.getStudent().getId())
                                .subjectName(r.getSubjectName())
                                .marksObtained(r.getMarksObtained())
                                .totalMarks(r.getTotalMarks())
                                .build()
                )
                .toList();
    }

}
