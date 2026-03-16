package com.school.portal.teacher.service;

import com.school.portal.common.enums.LeaveStatus;
import com.school.portal.core.entity.LeaveApplication;
import com.school.portal.core.repository.LeaveApplicationRepository;
import com.school.portal.notifications.NotificationService;
import com.school.portal.teacher.dto.TeacherLeaveDecisionRequest;
import com.school.portal.teacher.dto.TeacherLeaveRowDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherLeaveService {

    private final LeaveApplicationRepository leaveApplicationRepository;
    private final NotificationService notificationService;

    public List<TeacherLeaveRowDto> getMyRequests(String teacherId) {
        return leaveApplicationRepository.findByTeacher_TeacherIdOrderByAppliedAtDesc(teacherId)
                .stream()
                .map(l -> TeacherLeaveRowDto.builder()
                        .leaveId(l.getId())
                        .studentId(l.getStudent().getStudentId())
                        .studentName(l.getStudent().getFullName())
                        .standard(l.getStandard())
                        .section(l.getSection())
                        .subjectName(l.getSubjectName())
                        .fromDate(l.getFromDate().toString())
                        .toDate(l.getToDate().toString())
                        .purpose(l.getPurpose())
                        .description(l.getDescription())
                        .status(l.getStatus().name())
                        .teacherRemark(l.getTeacherRemark())
                        .teacherViewed(Boolean.TRUE.equals(l.getTeacherViewed()))
                        .appliedAt(l.getAppliedAt() != null ? l.getAppliedAt().toString() : null)
                        .reviewedAt(l.getReviewedAt() != null ? l.getReviewedAt().toString() : null)
                        .build())
                .toList();
    }

    public TeacherLeaveRowDto openOne(String teacherId, Long leaveId) {
        LeaveApplication l = leaveApplicationRepository.findByIdAndTeacher_TeacherId(leaveId, teacherId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        l.setTeacherViewed(true);
        leaveApplicationRepository.save(l);

        return TeacherLeaveRowDto.builder()
                .leaveId(l.getId())
                .studentId(l.getStudent().getStudentId())
                .studentName(l.getStudent().getFullName())
                .standard(l.getStandard())
                .section(l.getSection())
                .subjectName(l.getSubjectName())
                .fromDate(l.getFromDate().toString())
                .toDate(l.getToDate().toString())
                .purpose(l.getPurpose())
                .description(l.getDescription())
                .status(l.getStatus().name())
                .teacherRemark(l.getTeacherRemark())
                .teacherViewed(Boolean.TRUE.equals(l.getTeacherViewed()))
                .appliedAt(l.getAppliedAt() != null ? l.getAppliedAt().toString() : null)
                .reviewedAt(l.getReviewedAt() != null ? l.getReviewedAt().toString() : null)
                .build();
    }

    public String decide(String teacherId, Long leaveId, TeacherLeaveDecisionRequest req) {

        LeaveApplication l = leaveApplicationRepository.findByIdAndTeacher_TeacherId(leaveId, teacherId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if (req.getStatus() == null || req.getStatus().isBlank()) throw new RuntimeException("status is required");

        LeaveStatus status;
        try {
            status = LeaveStatus.valueOf(req.getStatus().trim().toUpperCase());
        } catch (Exception ex) {
            throw new RuntimeException("Invalid status. Use APPROVED or REJECTED");
        }

        if (status == LeaveStatus.PENDING) {
            throw new RuntimeException("Teacher cannot set status to PENDING");
        }

        l.setStatus(status);
        l.setTeacherRemark(req.getRemark() != null ? req.getRemark().trim() : null);
        l.setReviewedAt(LocalDateTime.now());
        l.setTeacherViewed(true);

        // ✅ Save FIRST (main operation)
        leaveApplicationRepository.save(l);

        // ✅ Notify student, BUT never break response if notification fails
        try {
            String studentId = (l.getStudent() != null) ? l.getStudent().getStudentId() : null;

            if (studentId != null && !studentId.isBlank()) {
                String remarkMsg = (l.getTeacherRemark() == null || l.getTeacherRemark().isBlank())
                        ? "—"
                        : l.getTeacherRemark();

                notificationService.notifyStudent(
                        studentId,
                        "Leave " + status.name(),
                        "Teacher " + teacherId + " " + status.name().toLowerCase()
                                + " your leave. Remark: " + remarkMsg,
                        "LEAVE",
                        l.getId()
                );
            }
        } catch (Exception ex) {
            System.out.println("⚠ Notification failed, leave still saved.");
    ex.printStackTrace(); // ✅ IMPORTANT
        }

        return "Leave " + status.name() + " successfully.";
    }
}
