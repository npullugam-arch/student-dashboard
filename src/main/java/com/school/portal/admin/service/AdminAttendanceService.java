// -------------------------------------------------
// 6) NEW: Admin Service
// FILE: src/main/java/com/school/portal/admin/service/AdminAttendanceService.java
// -------------------------------------------------
package com.school.portal.admin.service;

import com.school.portal.admin.dto.ResetAttendanceRequest;
import com.school.portal.admin.dto.ResetAttendanceResponse;
import com.school.portal.core.repository.AttendanceSessionRepository;
import com.school.portal.core.repository.DailyAttendanceRepository;
import com.school.portal.teacher.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAttendanceService {

    private final DailyAttendanceRepository dailyAttendanceRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public ResetAttendanceResponse resetAttendance(ResetAttendanceRequest req) {

        if (req.getStandard() == null) throw new RuntimeException("standard required");
        if (req.getSection() == null || req.getSection().isBlank()) throw new RuntimeException("section required");

        String confirm = (req.getConfirmText() == null) ? "" : req.getConfirmText().trim();
        if (!"RESET".equalsIgnoreCase(confirm)) {
            throw new RuntimeException("Confirmation failed. Type RESET to confirm.");
        }

        Integer standard = req.getStandard();
        String section = req.getSection().trim();

        // ✅ Delete daily attendance (overview + totals)
        long deletedDaily = dailyAttendanceRepository.deleteByStandardAndSection(standard, section);

        // ✅ Delete lock sessions (so teachers can take again)
        long deletedSessions = attendanceSessionRepository.deleteByStandardAndSection(standard, section);

        // ✅ Delete subject-wise attendance (if you also use it anywhere)
        long deletedSubject = attendanceRepository.deleteByStandardAndSection(standard, section);

        return new ResetAttendanceResponse(
                standard,
                section,
                deletedDaily,
                deletedSessions,
                deletedSubject,
                "Attendance reset completed for " + standard + "-" + section
        );
    }
}