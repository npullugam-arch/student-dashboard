package com.school.portal.teacher.service;

import com.school.portal.admin.repository.TeacherAssignmentRepository;
import com.school.portal.common.dto.ClassSectionDto;
import com.school.portal.common.dto.CreateDiaryRequest;
import com.school.portal.common.dto.DiaryRowDto;
import com.school.portal.common.dto.UpdateDiaryRequest;
import com.school.portal.core.entity.DiaryEntry;
import com.school.portal.core.entity.TeacherAssignment;
import com.school.portal.core.repository.DiaryEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TeacherDiaryService {

    private final DiaryEntryRepository diaryEntryRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public List<ClassSectionDto> myClasses(String teacherId) {

        List<TeacherAssignment> list =
                teacherAssignmentRepository.findByTeacher_TeacherIdAndActiveTrue(teacherId);

        // distinct standard+section
        Set<String> seen = new HashSet<>();
        List<ClassSectionDto> out = new ArrayList<>();

        for (TeacherAssignment a : list) {
            Integer std = (a.getStandardSubject() != null) ? a.getStandardSubject().getStandard() : null;
            String sec = a.getSection();
            if (std == null || sec == null) continue;

            String key = std + "-" + sec.trim().toUpperCase();
            if (seen.add(key)) {
                out.add(ClassSectionDto.builder()
                        .standard(std)
                        .section(sec.trim().toUpperCase())
                        .build());
            }
        }

        out.sort(Comparator.comparing(ClassSectionDto::getStandard).thenComparing(ClassSectionDto::getSection));
        return out;
    }

    // ✅ list (optional subject filter)
    public List<DiaryRowDto> myEntries(String teacherId, Integer standard, String section, String subjectName) {

        if (standard == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "standard is required");
        if (section == null || section.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "section is required");

        String sec = section.trim().toUpperCase();

        if (subjectName != null && !subjectName.isBlank()) {
            String subj = subjectName.trim();
            return diaryEntryRepository
                    .findTop50ByTeacherIdAndStandardAndSectionAndSubjectNameOrderByEntryDateDescCreatedAtDesc(
                            teacherId, standard, sec, subj
                    )
                    .stream()
                    .map(this::toDto)
                    .toList();
        }

        return diaryEntryRepository
                .findTop50ByTeacherIdAndStandardAndSectionOrderByEntryDateDescCreatedAtDesc(
                        teacherId, standard, sec
                )
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ✅ ONE diary for date
    public DiaryRowDto oneForDate(String teacherId, Integer standard, String section, String subjectName, String date) {
        if (standard == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "standard is required");
        if (section == null || section.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "section is required");
        if (subjectName == null || subjectName.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "subjectName is required");
        if (date == null || date.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required");

        String sec = section.trim().toUpperCase();
        String subj = subjectName.trim();
        LocalDate entryDate = LocalDate.parse(date.trim());

        DiaryEntry e = diaryEntryRepository
                .findByTeacherIdAndStandardAndSectionAndSubjectNameAndEntryDate(teacherId, standard, sec, subj, entryDate)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "DIARY_NOT_FOUND"));

        return toDto(e);
    }

    public String create(String teacherId, CreateDiaryRequest req) {

        if (req.getStandard() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "standard is required");
        if (req.getSection() == null || req.getSection().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "section is required");
        if (req.getSubjectName() == null || req.getSubjectName().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "subjectName is required");
        if (req.getEntryDate() == null || req.getEntryDate().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "entryDate is required");
        if (req.getTopic() == null || req.getTopic().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "topic is required");
        if (req.getWorkToday() == null || req.getWorkToday().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "workToday is required");

        Integer standard = req.getStandard();
        String section = req.getSection().trim().toUpperCase();
        String subjectName = req.getSubjectName().trim();
        LocalDate entryDate = LocalDate.parse(req.getEntryDate().trim());

        // ✅ Validate teacher is assigned to this standard-section AND subject
        List<TeacherAssignment> assignments =
                teacherAssignmentRepository.findByStandardSubject_StandardAndSectionAndActiveTrue(
                        standard, section
                );

        TeacherAssignment match = assignments.stream()
                .filter(a ->
                        a.getTeacher() != null &&
                                teacherId.equals(a.getTeacher().getTeacherId()) &&
                                a.getStandardSubject() != null &&
                                a.getStandardSubject().getSubject() != null &&
                                subjectName.equalsIgnoreCase(a.getStandardSubject().getSubject().getName())
                )
                .findFirst()
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.FORBIDDEN,
                                "Teacher not assigned to " + standard + "-" + section + " (" + subjectName + ")")
                );

        String teacherName = (match.getTeacher().getFullName() != null && !match.getTeacher().getFullName().isBlank())
                ? match.getTeacher().getFullName()
                : teacherId;

        // ✅ ONE diary rule (409 conflict)
        diaryEntryRepository.findByTeacherIdAndStandardAndSectionAndSubjectNameAndEntryDate(
                teacherId, standard, section, subjectName, entryDate
        ).ifPresent(x -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "DIARY_ALREADY_EXISTS");
        });

        DiaryEntry e = DiaryEntry.builder()
                .teacher(match.getTeacher())
                .teacherId(teacherId)
                .teacherName(teacherName)
                .standard(standard)
                .section(section)
                .subjectName(subjectName)
                .entryDate(entryDate)
                .topic(req.getTopic().trim())
                .workToday(req.getWorkToday().trim())
                .createdAt(LocalDateTime.now())
                .build();

        diaryEntryRepository.save(e);
        return "Diary saved successfully";
    }

    // ✅ UPDATE (teacher can edit topic/workToday/date)
    public String update(String teacherId, Long id, UpdateDiaryRequest req) {

        DiaryEntry e = diaryEntryRepository.findByIdAndTeacherId(id, teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "DIARY_NOT_FOUND"));

        // If client sends these, we validate; else reuse existing
        Integer standard = (req.getStandard() != null) ? req.getStandard() : e.getStandard();
        String section = (req.getSection() != null && !req.getSection().isBlank())
                ? req.getSection().trim().toUpperCase()
                : e.getSection();
        String subjectName = (req.getSubjectName() != null && !req.getSubjectName().isBlank())
                ? req.getSubjectName().trim()
                : e.getSubjectName();
        LocalDate entryDate = (req.getEntryDate() != null && !req.getEntryDate().isBlank())
                ? LocalDate.parse(req.getEntryDate().trim())
                : e.getEntryDate();

        String topic = (req.getTopic() != null) ? req.getTopic().trim() : e.getTopic();
        String workToday = (req.getWorkToday() != null) ? req.getWorkToday().trim() : e.getWorkToday();

        if (topic.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "topic is required");
        if (workToday.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "workToday is required");

        // ✅ prevent conflict if date (or filters) changed
        boolean conflict = diaryEntryRepository.existsByTeacherIdAndStandardAndSectionAndSubjectNameAndEntryDateAndIdNot(
                teacherId, standard, section, subjectName, entryDate, id
        );
        if (conflict) throw new ResponseStatusException(HttpStatus.CONFLICT, "DIARY_ALREADY_EXISTS");

        e.setStandard(standard);
        e.setSection(section);
        e.setSubjectName(subjectName);
        e.setEntryDate(entryDate);
        e.setTopic(topic);
        e.setWorkToday(workToday);

        diaryEntryRepository.save(e);
        return "Diary updated successfully";
    }

    // ✅ DELETE
    public String delete(String teacherId, Long id) {
        DiaryEntry e = diaryEntryRepository.findByIdAndTeacherId(id, teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "DIARY_NOT_FOUND"));
        diaryEntryRepository.delete(e);
        return "Diary deleted successfully";
    }

    private DiaryRowDto toDto(DiaryEntry d) {
        return DiaryRowDto.builder()
                .id(d.getId())
                .teacherId(d.getTeacherId())
                .teacherName(d.getTeacherName())
                .standard(d.getStandard())
                .section(d.getSection())
                .subjectName(d.getSubjectName())
                .entryDate(d.getEntryDate() != null ? d.getEntryDate().toString() : null)
                .topic(d.getTopic())
                .workToday(d.getWorkToday())
                .createdAt(d.getCreatedAt() != null ? d.getCreatedAt().toString() : null)
                .build();
    }
}