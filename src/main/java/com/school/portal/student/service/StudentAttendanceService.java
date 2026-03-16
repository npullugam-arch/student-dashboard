package com.school.portal.student.service;

import com.school.portal.common.enums.AttendanceStatus;
import com.school.portal.core.entity.DailyAttendance;
import com.school.portal.core.repository.DailyAttendanceRepository;
import com.school.portal.student.dto.AttendanceDayDto;
import com.school.portal.student.dto.AttendanceSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentAttendanceService {

    private final DailyAttendanceRepository dailyAttendanceRepository;

    public AttendanceSummaryDto getSummary(String studentId) {

        long total = dailyAttendanceRepository.countByStudentId(studentId);
        long present = dailyAttendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
        long absent = dailyAttendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.ABSENT);

        int percent = (total == 0) ? 0 : (int) Math.round((present * 100.0) / total);

        return new AttendanceSummaryDto(studentId, total, present, absent, percent);
    }

    public List<AttendanceDayDto> getList(String studentId, String from, String to) {

        LocalDate f = LocalDate.parse(from);
        LocalDate t = LocalDate.parse(to);

        List<DailyAttendance> list =
                dailyAttendanceRepository.findByStudentIdAndAttendanceDateBetweenOrderByAttendanceDateAsc(studentId, f, t);

        return list.stream()
                .map(a -> new AttendanceDayDto(a.getAttendanceDate().toString(), a.getStatus().name()))
                .toList();
    }
}
