package com.school.portal.core.repository;

import com.school.portal.core.entity.ShortNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShortNoteRepository extends JpaRepository<ShortNote, Long> {

    List<ShortNote> findByStandardAndSectionAndActiveTrueOrderByCreatedAtDesc(Integer standard, String section);

    List<ShortNote> findByTeacherIdAndActiveTrueOrderByCreatedAtDesc(String teacherId);
}
