package com.school.portal.notes.service;

import com.school.portal.core.entity.Student;
import com.school.portal.core.repository.ShortNoteRepository;
import com.school.portal.core.repository.StudentCoreRepository;
import com.school.portal.notes.dto.ShortNoteDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentShortNoteService {

    private final StudentCoreRepository studentCoreRepository;
    private final ShortNoteRepository shortNoteRepository;

    public List<ShortNoteDto> myNotes(String studentId) {
        Student student = studentCoreRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        return shortNoteRepository
                .findByStandardAndSectionAndActiveTrueOrderByCreatedAtDesc(student.getStandard(), student.getSection())
                .stream()
                .map(n -> ShortNoteDto.builder()
                        .id(n.getId())
                        .teacherId(n.getTeacherId())
                        .standard(n.getStandard())
                        .section(n.getSection())
                        .title(n.getTitle())
                        .topic(n.getTopic())
                        .fileUrl(n.getFileUrl())
                        .createdAt(n.getCreatedAt() == null ? null : n.getCreatedAt().toString())
                        .build()
                )
                .toList();
    }
}
