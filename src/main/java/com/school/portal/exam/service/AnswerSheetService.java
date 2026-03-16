package com.school.portal.exam.service;

import com.school.portal.admin.repository.StudentRepository;
import com.school.portal.exam.config.UploadProperties;
import com.school.portal.exam.dto.AnswerSheetRow;
import com.school.portal.exam.entity.AnswerSheet;
import com.school.portal.exam.entity.Exam;
import com.school.portal.exam.repository.AnswerSheetRepository;
import com.school.portal.exam.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnswerSheetService {

    private final UploadProperties uploadProperties;
    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final AnswerSheetRepository answerSheetRepository;

    private Path ensureDir() {
        Path dir = Paths.get(uploadProperties.getAnswerSheetsDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload dir: " + dir, e);
        }
        return dir;
    }

    private static String safeName(String name) {
        String cleaned = StringUtils.cleanPath(name == null ? "" : name);
        cleaned = cleaned.replace("\\", "_").replace("/", "_");
        return cleaned.isBlank() ? "file.pdf" : cleaned;
    }

    private static void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new RuntimeException("PDF file required");
        String ct = (file.getContentType() == null) ? "" : file.getContentType().toLowerCase();
        String name = (file.getOriginalFilename() == null) ? "" : file.getOriginalFilename().toLowerCase();
        if (!ct.contains("pdf") && !name.endsWith(".pdf")) {
            throw new RuntimeException("Only PDF allowed");
        }
    }

    @Transactional
    public AnswerSheetRow uploadOrReplace(Long examId, Long studentDbId, String subjectName, String teacherId, MultipartFile file) {
        validatePdf(file);

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found: " + examId));

        var student = studentRepository.findById(studentDbId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentDbId));

        String subj = (subjectName == null ? "" : subjectName.trim());
        if (subj.isBlank()) throw new RuntimeException("Subject required");

        // check existing (replace)
        AnswerSheet existing = answerSheetRepository
                .findByExam_IdAndStudent_IdAndSubjectNameIgnoreCase(examId, studentDbId, subj)
                .orElse(null);

        Path dir = ensureDir();
        String original = safeName(file.getOriginalFilename());
        String stored = UUID.randomUUID() + "__" + original;
        Path target = dir.resolve(stored);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }

        // if existing, delete old file from disk
        if (existing != null) {
            try {
                Path old = Paths.get(existing.getStoragePath());
                Files.deleteIfExists(old);
            } catch (Exception ignored) {
            }
            existing.setOriginalFileName(original);
            existing.setStoredFileName(stored);
            existing.setStoragePath(target.toString());
            existing.setContentType(file.getContentType() == null ? "application/pdf" : file.getContentType());
            existing.setSizeBytes(file.getSize());
            existing.setUploadedByTeacherId(teacherId);
            existing.setUploadedAt(LocalDateTime.now());
            AnswerSheet saved = answerSheetRepository.save(existing);
            return toRow(saved);
        }

        AnswerSheet created = AnswerSheet.builder()
                .exam(exam)
                .student(student)
                .subjectName(subj)
                .originalFileName(original)
                .storedFileName(stored)
                .storagePath(target.toString())
                .contentType(file.getContentType() == null ? "application/pdf" : file.getContentType())
                .sizeBytes(file.getSize())
                .uploadedByTeacherId(teacherId)
                .uploadedAt(LocalDateTime.now())
                .build();

        AnswerSheet saved = answerSheetRepository.save(created);
        return toRow(saved);
    }

    public List<AnswerSheetRow> listForStudent(String studentId, Long examId) {
        return answerSheetRepository
                .findByExam_IdAndStudent_StudentIdOrderByUploadedAtDesc(examId, studentId)
                .stream().map(this::toRow)
                .toList();
    }

    public List<AnswerSheetRow> listForClass(Long examId, Integer standard, String section) {
        return answerSheetRepository
                .findByExam_IdAndStudent_StandardAndStudent_SectionOrderByStudent_FullNameAsc(examId, standard, section)
                .stream().map(this::toRow)
                .toList();
    }

    @Transactional
    public String delete(Long id) {
        AnswerSheet sheet = answerSheetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Answer sheet not found: " + id));

        try {
            Files.deleteIfExists(Paths.get(sheet.getStoragePath()));
        } catch (Exception ignored) {
        }

        answerSheetRepository.delete(sheet);
        return "✅ Deleted";
    }

    public Resource loadFile(Long id) {
        AnswerSheet sheet = answerSheetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Answer sheet not found: " + id));

        Path p = Paths.get(sheet.getStoragePath());
        if (!Files.exists(p)) throw new RuntimeException("File missing on disk");
        return new FileSystemResource(p);
    }

    public AnswerSheet getMeta(Long id) {
        return answerSheetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Answer sheet not found: " + id));
    }

    private AnswerSheetRow toRow(AnswerSheet s) {
        return AnswerSheetRow.builder()
                .id(s.getId())
                .examId(s.getExam().getId())
                .studentDbId(s.getStudent().getId())
                .studentId(s.getStudent().getStudentId())
                .studentName(s.getStudent().getFullName())
                .studentProfileUrl(s.getStudent().getProfileUrl())
                .subjectName(s.getSubjectName())
                .originalFileName(s.getOriginalFileName())
                .contentType(s.getContentType())
                .sizeBytes(s.getSizeBytes())
                .uploadedByTeacherId(s.getUploadedByTeacherId())
                .uploadedAt(s.getUploadedAt())
                .build();
    }
}
