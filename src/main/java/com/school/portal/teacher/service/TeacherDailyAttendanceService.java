package com.school.portal.teacher.service;

import com.school.portal.common.enums.AttendanceStatus;
import com.school.portal.core.entity.AttendanceSession;
import com.school.portal.core.entity.DailyAttendance;
import com.school.portal.core.entity.Student;
import com.school.portal.core.repository.AttendanceSessionRepository;
import com.school.portal.core.repository.DailyAttendanceRepository;
import com.school.portal.core.repository.StudentCoreRepository;
import com.school.portal.teacher.dto.DailyAttendanceMarkRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TeacherDailyAttendanceService {

    private final AttendanceSessionRepository attendanceSessionRepository;
    private final DailyAttendanceRepository dailyAttendanceRepository;
    private final StudentCoreRepository studentCoreRepository;

    // ✅ EXISTING METHOD (UNCHANGED)
    public String markDailyAttendance(DailyAttendanceMarkRequest request) {

        if (request.getTeacherId() == null || request.getTeacherId().isBlank())
            throw new RuntimeException("teacherId required");

        if (request.getStandard() == null || request.getSection() == null || request.getSection().isBlank())
            throw new RuntimeException("standard and section required");

        if (request.getDate() == null || request.getDate().isBlank())
            throw new RuntimeException("date required");

        LocalDate date = LocalDate.parse(request.getDate());

        attendanceSessionRepository
                .findByStandardAndSectionAndAttendanceDate(
                        request.getStandard(), request.getSection(), date
                )
                .ifPresent(s -> {
                    throw new RuntimeException(
                            "Attendance already marked for " +
                                    request.getStandard() + "-" + request.getSection() +
                                    " on " + date + " by " + s.getTeacherId()
                    );
                });

        AttendanceSession session = AttendanceSession.builder()
                .standard(request.getStandard())
                .section(request.getSection())
                .attendanceDate(date)
                .teacherId(request.getTeacherId())
                .createdAt(LocalDateTime.now())
                .build();

        attendanceSessionRepository.save(session);

        List<Student> students =
                studentCoreRepository.findByStandardAndSection(
                        request.getStandard(), request.getSection()
                );

        for (Student s : students) {
            boolean present = request.getAttendance() != null
                    && Boolean.TRUE.equals(request.getAttendance().get(s.getStudentId()));

            DailyAttendance row = DailyAttendance.builder()
                    .studentId(s.getStudentId())
                    .standard(request.getStandard())
                    .section(request.getSection())
                    .attendanceDate(date)
                    .status(present ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT)
                    .build();

            dailyAttendanceRepository.save(row);
        }

        return "Attendance marked successfully for "
                + request.getStandard() + "-" + request.getSection()
                + " on " + date + " (LOCKED)";
    }

    // ✅ NEW METHOD (READ-ONLY STATUS CHECK)
    public Map<String, Object> checkAttendanceStatus(
            Integer standard, String section, LocalDate date) {

        Map<String, Object> res = new HashMap<>();

        attendanceSessionRepository
                .findByStandardAndSectionAndAttendanceDate(standard, section, date)
                .ifPresentOrElse(
                        s -> {
                            res.put("taken", true);
                            res.put("teacherId", s.getTeacherId());
                        },
                        () -> res.put("taken", false)
                );

        return res;
    }
}
