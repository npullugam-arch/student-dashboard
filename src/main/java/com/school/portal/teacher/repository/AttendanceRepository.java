// -------------------------------------------------
// 3) UPDATE: AttendanceRepository (subject-wise attendance)
// FILE: src/main/java/com/school/portal/teacher/repository/AttendanceRepository.java
// -------------------------------------------------
package com.school.portal.teacher.repository;

import com.school.portal.common.enums.Subject;
import com.school.portal.core.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentId(String studentId);

    List<Attendance> findByStandardAndSectionAndSubjectAndAttendanceDate(
            Integer standard,
            String section,
            Subject subject,
            LocalDate attendanceDate
    );

    // ✅ NEW: Admin reset (delete all subject-wise rows for a class-section)
    long deleteByStandardAndSection(Integer standard, String section);
}