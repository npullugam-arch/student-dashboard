package com.school.portal.student.service;

import com.school.portal.admin.repository.TeacherAssignmentRepository;
import com.school.portal.common.enums.LeaveStatus;
import com.school.portal.core.entity.LeaveApplication;
import com.school.portal.core.entity.Student;
import com.school.portal.core.entity.TeacherAssignment;
import com.school.portal.core.repository.LeaveApplicationRepository;
import com.school.portal.core.repository.StudentCoreRepository;
import com.school.portal.notifications.NotificationService;
import com.school.portal.student.dto.CreateLeaveRequest;
import com.school.portal.student.dto.FacultyDto;
import com.school.portal.student.dto.StudentLeaveRowDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentLeaveService {

    private final StudentCoreRepository studentCoreRepository;
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StudentDashboardService studentDashboardService;

    private final NotificationService notificationService;

    public List<FacultyDto> getMySubjectTeachers(String studentId) {
        return studentDashboardService.getMyFaculties(studentId);
    }

    public String applyLeave(CreateLeaveRequest req) {

        if (req.getStudentId() == null || req.getStudentId().isBlank()) throw new RuntimeException("studentId is required");
        if (req.getTeacherId() == null || req.getTeacherId().isBlank()) throw new RuntimeException("teacherId is required");
        if (req.getSubjectName() == null || req.getSubjectName().isBlank()) throw new RuntimeException("subjectName is required");

        if (req.getFromDate() == null || req.getFromDate().isBlank()) throw new RuntimeException("fromDate is required");
        if (req.getToDate() == null || req.getToDate().isBlank()) throw new RuntimeException("toDate is required");

        if (req.getPurpose() == null || req.getPurpose().isBlank()) throw new RuntimeException("purpose is required");
        if (req.getDescription() == null || req.getDescription().isBlank()) throw new RuntimeException("description is required");

        Student student = studentCoreRepository.findByStudentId(req.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + req.getStudentId()));

        LocalDate from = LocalDate.parse(req.getFromDate());
        LocalDate to = LocalDate.parse(req.getToDate());
        if (from.isAfter(to)) throw new RuntimeException("fromDate must be <= toDate");

        List<TeacherAssignment> assignments =
                teacherAssignmentRepository.findByStandardSubject_StandardAndSectionAndActiveTrue(
                        student.getStandard(), student.getSection()
                );

        TeacherAssignment match = assignments.stream()
                .filter(a ->
                        a.getTeacher() != null
                                && req.getTeacherId().equals(a.getTeacher().getTeacherId())
                                && a.getStandardSubject() != null
                                && a.getStandardSubject().getSubject() != null
                                && a.getStandardSubject().getSubject().getName() != null
                                && a.getStandardSubject().getSubject().getName().equalsIgnoreCase(req.getSubjectName())
                )
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid teacher/subject for this student class & section"));

        LeaveApplication leave = LeaveApplication.builder()
                .student(student)
                .teacher(match.getTeacher())
                .studentIdLegacy(student.getId())
                .teacherIdLegacy(match.getTeacher().getId())
                .subjectName(req.getSubjectName().trim())
                .standard(student.getStandard())
                .section(student.getSection())
                .fromDate(from)
                .toDate(to)
                .purpose(req.getPurpose().trim())
                .description(req.getDescription().trim())
                .status(LeaveStatus.PENDING)
                .teacherRemark(null)
                .teacherViewed(false)
                .appliedAt(LocalDateTime.now())
                .reviewedAt(null)
                .build();

        // ✅ Save FIRST (main operation)
        leaveApplicationRepository.save(leave);

        // ✅ Notify teacher, BUT never break the response if notification fails
        try {
            String studentName = (student.getFullName() != null && !student.getFullName().isBlank())
                    ? student.getFullName()
                    : student.getStudentId();

            notificationService.notifyTeacher(
                    match.getTeacher().getTeacherId(),
                    "New Leave Application",
                    "Student " + studentName + " applied leave (" + from + " to " + to + ") • " + req.getSubjectName(),
                    "LEAVE",
                    leave.getId()
            );
        } catch (Exception ex) {
              System.out.println("⚠ Notification failed, leave still saved.");
             ex.printStackTrace(); // ✅ IMPORTANT
        }

        return "Leave applied successfully";
    }

    public List<StudentLeaveRowDto> getMyLeaves(String studentId) {
        return leaveApplicationRepository.findByStudent_StudentIdOrderByAppliedAtDesc(studentId)
                .stream()
                .map(l -> StudentLeaveRowDto.builder()
                        .leaveId(l.getId())
                        .teacherId(l.getTeacher().getTeacherId())
                        .teacherName(l.getTeacher().getFullName())
                        .subjectName(l.getSubjectName())
                        .fromDate(l.getFromDate().toString())
                        .toDate(l.getToDate().toString())
                        .purpose(l.getPurpose())
                        .status(l.getStatus().name())
                        .teacherRemark(l.getTeacherRemark())
                        .teacherViewed(Boolean.TRUE.equals(l.getTeacherViewed()))
                        .appliedAt(l.getAppliedAt() != null ? l.getAppliedAt().toString() : null)
                        .reviewedAt(l.getReviewedAt() != null ? l.getReviewedAt().toString() : null)
                        .build())
                .toList();
    }

    public StudentLeaveRowDto getLeaveDetail(String studentId, Long leaveId) {
        LeaveApplication l = leaveApplicationRepository.findByIdAndStudent_StudentId(leaveId, studentId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        return StudentLeaveRowDto.builder()
                .leaveId(l.getId())
                .teacherId(l.getTeacher().getTeacherId())
                .teacherName(l.getTeacher().getFullName())
                .subjectName(l.getSubjectName())
                .fromDate(l.getFromDate().toString())
                .toDate(l.getToDate().toString())
                .purpose(l.getPurpose())
                .status(l.getStatus().name())
                .teacherRemark(l.getTeacherRemark())
                .teacherViewed(Boolean.TRUE.equals(l.getTeacherViewed()))
                .appliedAt(l.getAppliedAt() != null ? l.getAppliedAt().toString() : null)
                .reviewedAt(l.getReviewedAt() != null ? l.getReviewedAt().toString() : null)
                .build();
    }
}
