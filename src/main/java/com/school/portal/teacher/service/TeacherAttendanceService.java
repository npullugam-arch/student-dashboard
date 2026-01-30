package com.school.portal.teacher.service;

import com.school.portal.common.enums.Subject;
import com.school.portal.core.entity.Attendance;
import com.school.portal.teacher.dto.MarkAttendanceRequest;
import com.school.portal.teacher.dto.StudentAttendanceRequest;
import com.school.portal.teacher.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TeacherAttendanceService {

    private final AttendanceRepository attendanceRepository;

    public String markAttendance(String teacherId, MarkAttendanceRequest request) {

        Subject subject = Subject.valueOf(request.getSubject().toUpperCase());
        LocalDate date = LocalDate.parse(request.getAttendanceDate());

        for (StudentAttendanceRequest s : request.getStudents()) {

            Attendance attendance = Attendance.builder()
                    .studentId(s.getStudentId())
                    .teacherId(teacherId)
                    .standard(request.getStandard())
                    .section(request.getSection())
                    .subject(subject)
                    .attendanceDate(date)
                    .present(s.isPresent())
                    .build();

            attendanceRepository.save(attendance);
        }

        return "Attendance marked successfully for "
                + request.getStandard() + "-" + request.getSection()
                + " (" + subject + ") on " + date;
    }
}
