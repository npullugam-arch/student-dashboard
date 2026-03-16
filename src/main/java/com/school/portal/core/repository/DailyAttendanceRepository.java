// =========================================
// BACKEND (Spring Boot) - ADD/UPDATE FILES
// =========================================

// -------------------------------------------------
// 1) UPDATE: DailyAttendanceRepository
// FILE: src/main/java/com/school/portal/core/repository/DailyAttendanceRepository.java
// -------------------------------------------------
package com.school.portal.core.repository;

import com.school.portal.core.entity.DailyAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DailyAttendanceRepository extends JpaRepository<DailyAttendance, Long> {

    List<DailyAttendance> findByStudentIdAndAttendanceDateBetweenOrderByAttendanceDateAsc(
            String studentId, LocalDate from, LocalDate to
    );

    long countByStudentIdAndStatus(String studentId, com.school.portal.common.enums.AttendanceStatus status);

    long countByStudentId(String studentId);

    // ✅ NEW: Admin reset (delete all daily attendance for a class-section)
    long deleteByStandardAndSection(Integer standard, String section);
}