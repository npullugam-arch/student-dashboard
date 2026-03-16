package com.school.portal.core.repository;

import com.school.portal.core.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    Optional<Timetable> findByStandardAndSection(Integer standard, String section);
}
