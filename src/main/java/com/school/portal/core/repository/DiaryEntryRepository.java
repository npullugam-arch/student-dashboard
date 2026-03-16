package com.school.portal.core.repository;

import com.school.portal.core.entity.DiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {

    // ✅ Student side / public view (class diary): subject-wise (currently not filtering by subject)
    List<DiaryEntry> findTop50ByStandardAndSectionOrderByEntryDateDescCreatedAtDesc(
            Integer standard, String section
    );

    // ✅ Teacher side
    List<DiaryEntry> findTop50ByTeacherIdAndStandardAndSectionOrderByEntryDateDescCreatedAtDesc(
            String teacherId, Integer standard, String section
    );

    // ✅ Teacher side: subject-wise filter
    List<DiaryEntry> findTop50ByTeacherIdAndStandardAndSectionAndSubjectNameOrderByEntryDateDescCreatedAtDesc(
            String teacherId, Integer standard, String section, String subjectName
    );

    // ✅ ONE diary rule: find for exact date
    Optional<DiaryEntry> findByTeacherIdAndStandardAndSectionAndSubjectNameAndEntryDate(
            String teacherId, Integer standard, String section, String subjectName, LocalDate entryDate
    );

    // ✅ ownership check for edit/delete
    Optional<DiaryEntry> findByIdAndTeacherId(Long id, String teacherId);

    // ✅ for update when changing date (exclude current id)
    boolean existsByTeacherIdAndStandardAndSectionAndSubjectNameAndEntryDateAndIdNot(
            String teacherId, Integer standard, String section, String subjectName, LocalDate entryDate, Long id
    );
}