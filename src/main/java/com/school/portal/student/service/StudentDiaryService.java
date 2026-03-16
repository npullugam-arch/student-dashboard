package com.school.portal.student.service;

import com.school.portal.common.dto.DiaryRowDto;
import com.school.portal.core.entity.Student;
import com.school.portal.core.repository.DiaryEntryRepository;
import com.school.portal.core.repository.StudentCoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentDiaryService {

    private final StudentCoreRepository studentCoreRepository;
    private final DiaryEntryRepository diaryEntryRepository;

    public List<DiaryRowDto> myDiary(String studentId) {
        Student s = studentCoreRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        return diaryEntryRepository
                .findTop50ByStandardAndSectionOrderByEntryDateDescCreatedAtDesc(s.getStandard(), s.getSection())
                .stream()
                .map(d -> DiaryRowDto.builder()
                        .id(d.getId())
                        .teacherId(d.getTeacherId())
                        .teacherName(d.getTeacherName())
                        .standard(d.getStandard())
                        .section(d.getSection())
                        .entryDate(d.getEntryDate().toString())
                        .topic(d.getTopic())
                        .workToday(d.getWorkToday())
                        .createdAt(d.getCreatedAt() != null ? d.getCreatedAt().toString() : null)
                        .build())
                .toList();
    }
}
