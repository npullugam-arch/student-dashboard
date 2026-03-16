package com.school.portal.teacher.service;

import com.school.portal.common.dto.DoubtListRow;
import com.school.portal.common.dto.DoubtThreadResponse;
import com.school.portal.common.dto.SendMessageRequest;
import com.school.portal.common.enums.DoubtStatus;
import com.school.portal.core.entity.Doubt;
import com.school.portal.core.entity.DoubtMessage;
import com.school.portal.core.repository.DoubtMessageRepository;
import com.school.portal.core.repository.DoubtRepository;
import com.school.portal.admin.repository.StandardSubjectRepository;
import com.school.portal.admin.repository.TeacherRepository;
import com.school.portal.notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherDoubtService {

    private final DoubtRepository doubtRepository;
    private final DoubtMessageRepository doubtMessageRepository;

    private final NotificationService notificationService;

    // for teacher name + subject name in notification to student
    private final TeacherRepository teacherRepository;
    private final StandardSubjectRepository standardSubjectRepository;

    public List<DoubtListRow> listTeacherDoubts(String teacherId, DoubtStatus status) {

        if (teacherId == null || teacherId.isBlank())
            throw new RuntimeException("teacherId is required");

        List<Doubt> list = (status == null)
                ? doubtRepository.findByTeacherIdOrderByLastMessageAtDesc(teacherId)
                : doubtRepository.findByTeacherIdAndStatusOrderByLastMessageAtDesc(teacherId, status);

        return list.stream().map(d -> DoubtListRow.builder()
                .id(d.getId())
                .title(d.getTitle())
                .topic(d.getTopic())
                .status(d.getStatus())
                .studentId(d.getStudentId())
                .teacherId(d.getTeacherId())
                .standard(d.getStandard())
                .section(d.getSection())
                .standardSubjectId(d.getStandardSubjectId())
                .teacherViewed(d.isTeacherViewed())
                .studentViewed(d.isStudentViewed())
                .lastMessageAt(d.getLastMessageAt())
                .build()).toList();
    }

    public DoubtThreadResponse getThreadAsTeacher(Long doubtId, String teacherId) {

        Doubt d = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new RuntimeException("Doubt not found: " + doubtId));

        if (!d.getTeacherId().equalsIgnoreCase(teacherId))
            throw new RuntimeException("Not allowed");

        // mark teacher viewed
        d.setTeacherViewed(true);
        d.setTeacherViewedAt(LocalDateTime.now());
        doubtRepository.save(d);

        var msgs = doubtMessageRepository.findByDoubtIdOrderByCreatedAtAsc(doubtId)
                .stream().map(m -> DoubtThreadResponse.MessageRow.builder()
                        .id(m.getId())
                        .senderRole(m.getSenderRole())
                        .senderId(m.getSenderId())
                        .message(m.getMessage())
                        .createdAt(m.getCreatedAt())
                        .build()).toList();

        return DoubtThreadResponse.builder()
                .id(d.getId())
                .title(d.getTitle())
                .topic(d.getTopic())
                .description(d.getDescription())
                .status(d.getStatus())
                .studentId(d.getStudentId())
                .teacherId(d.getTeacherId())
                .standard(d.getStandard())
                .section(d.getSection())
                .standardSubjectId(d.getStandardSubjectId())
                .teacherViewed(d.isTeacherViewed())
                .studentViewed(d.isStudentViewed())
                .createdAt(d.getCreatedAt())
                .lastMessageAt(d.getLastMessageAt())
                .messages(msgs)
                .build();
    }

    public String sendMessageAsTeacher(Long doubtId, String teacherId, SendMessageRequest req) {

        if (req.getMessage() == null || req.getMessage().isBlank())
            throw new RuntimeException("message is required");

        Doubt d = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new RuntimeException("Doubt not found"));

        if (!d.getTeacherId().equalsIgnoreCase(teacherId))
            throw new RuntimeException("Not allowed");

        doubtMessageRepository.save(DoubtMessage.builder()
                .doubtId(doubtId)
                .senderRole("TEACHER")
                .senderId(teacherId)
                .message(req.getMessage().trim())
                .build());

        d.setStudentViewed(false);
        d.setLastMessageAt(LocalDateTime.now());

        // teacher replied => mark answered automatically
        if (d.getStatus() == DoubtStatus.OPEN)
            d.setStatus(DoubtStatus.ANSWERED);

        doubtRepository.save(d);

        // 🔔 NOTIFY STUDENT (include teacher name + subject)
        String teacherName = teacherRepository.findByTeacherId(teacherId)
                .map(t -> t.getFullName())
                .orElse(teacherId);

        String subjectName = standardSubjectRepository.findById(d.getStandardSubjectId())
                .map(ss -> ss.getSubject() != null ? ss.getSubject().getName() : "Subject")
                .orElse("Subject");

        notificationService.notifyStudent(
                d.getStudentId(),
                "Teacher Replied",
                "Teacher " + teacherName + " (" + subjectName + ") replied to your doubt: " + d.getTitle(),
                "DOUBT",
                doubtId
        );

        return "Reply sent";
    }

    public String updateStatus(Long doubtId, String teacherId, DoubtStatus status) {

        Doubt d = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new RuntimeException("Doubt not found"));

        if (!d.getTeacherId().equalsIgnoreCase(teacherId))
            throw new RuntimeException("Not allowed");

        if (status == null)
            throw new RuntimeException("status is required");

        d.setStatus(status);
        d.setLastMessageAt(LocalDateTime.now());
        doubtRepository.save(d);

        // 🔔 NOTIFY STUDENT (include teacher name + subject)
        String teacherName = teacherRepository.findByTeacherId(teacherId)
                .map(t -> t.getFullName())
                .orElse(teacherId);

        String subjectName = standardSubjectRepository.findById(d.getStandardSubjectId())
                .map(ss -> ss.getSubject() != null ? ss.getSubject().getName() : "Subject")
                .orElse("Subject");

        notificationService.notifyStudent(
                d.getStudentId(),
                "Doubt Status Updated",
                "Teacher " + teacherName + " (" + subjectName + ") updated your doubt '" + d.getTitle() +
                        "' to " + status.name(),
                "DOUBT",
                doubtId
        );

        return "Status updated to " + status;
    }
}
