package com.school.portal.student.service;

import com.school.portal.core.entity.Attendance;
import com.school.portal.student.dto.AttendanceDto;
import com.school.portal.teacher.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentAttendanceService {

    private final AttendanceRepository attendanceRepository;

    public List<AttendanceDto> getMyAttendance(String studentId) {

        List<Attendance> records = attendanceRepository.findByStudentId(studentId);

        return records.stream()
                .sorted(Comparator.comparing(Attendance::getAttendanceDate).reversed())
                .map(a -> new AttendanceDto(
                        a.getAttendanceDate().toString(),
                        a.getSubject().name(),
                        a.isPresent(),
                        a.getTeacherId()
                ))
                .toList();
    }
}
