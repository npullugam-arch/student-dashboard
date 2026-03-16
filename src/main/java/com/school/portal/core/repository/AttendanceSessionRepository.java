// -------------------------------------------------
// 2) UPDATE: AttendanceSessionRepository
// FILE: src/main/java/com/school/portal/core/repository/AttendanceSessionRepository.java
// -------------------------------------------------
package com.school.portal.core.repository;

import com.school.portal.core.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findByStandardAndSectionAndAttendanceDate(Integer standard, String section, LocalDate attendanceDate);

    // ✅ NEW: Admin reset (delete all lock sessions for a class-section)
    long deleteByStandardAndSection(Integer standard, String section);
}