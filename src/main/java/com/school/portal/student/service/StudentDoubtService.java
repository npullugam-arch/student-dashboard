package com.school.portal.student.service;

import com.school.portal.common.dto.DoubtListRow;
import com.school.portal.common.dto.DoubtThreadResponse;
import com.school.portal.common.dto.SendMessageRequest;
import com.school.portal.common.enums.DoubtStatus;
import com.school.portal.core.entity.Doubt;
import com.school.portal.core.entity.DoubtMessage;
import com.school.portal.core.entity.Student;
import com.school.portal.core.entity.TeacherAssignment;
import com.school.portal.core.repository.DoubtMessageRepository;
import com.school.portal.core.repository.DoubtRepository;
import com.school.portal.core.repository.StudentCoreRepository;
import com.school.portal.admin.repository.StandardSubjectRepository;
import com.school.portal.admin.repository.TeacherAssignmentRepository;
import com.school.portal.notifications.NotificationService;
import com.school.portal.student.dto.CreateDoubtRequest;
import com.school.portal.student.dto.TeacherCardDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentDoubtService {

    private final DoubtRepository doubtRepository;
    private final DoubtMessageRepository doubtMessageRepository;
    private final StudentCoreRepository studentCoreRepository;

    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StandardSubjectRepository standardSubjectRepository;

    private final NotificationService notificationService;

    public List<TeacherCardDto> getAssignedTeachers(String studentId) {

        Student st = studentCoreRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        Integer standard = st.getStandard();
        String section = st.getSection();

        var standardSubjects = standardSubjectRepository.findByStandardAndActiveTrue(standard);

        return standardSubjects.stream().map(ss -> {

            TeacherAssignment ta = teacherAssignmentRepository
                    .findByStandardSubject_IdAndSectionAndActiveTrue(ss.getId(), section)
                    .orElse(null);

            if (ta == null) return null;

            var teacher = ta.getTeacher();

            return TeacherCardDto.builder()
                    .teacherId(teacher.getTeacherId())
                    .teacherName(teacher.getFullName())
                    .profileUrl(teacher.getProfileUrl())
                    .standard(standard)
                    .section(section)
                    .standardSubjectId(ss.getId())
                    .subjectName(ss.getSubject() != null ? ss.getSubject().getName() : "UNKNOWN")
                    .build();

        }).filter(x -> x != null).toList();
    }

    public String createDoubt(CreateDoubtRequest req) {

        if (req.getStudentId() == null || req.getStudentId().isBlank())
            throw new RuntimeException("studentId is required");
        if (req.getTeacherId() == null || req.getTeacherId().isBlank())
            throw new RuntimeException("teacherId is required");
        if (req.getStandardSubjectId() == null)
            throw new RuntimeException("standardSubjectId is required");
        if (req.getSection() == null || req.getSection().isBlank())
            throw new RuntimeException("section is required");
        if (req.getTitle() == null || req.getTitle().isBlank())
            throw new RuntimeException("title is required");
        if (req.getDescription() == null || req.getDescription().isBlank())
            throw new RuntimeException("description is required");

        // Validate student exists
        Student st = studentCoreRepository.findByStudentId(req.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + req.getStudentId()));

        // Validate section matches student section
        if (st.getSection() == null || !st.getSection().equalsIgnoreCase(req.getSection())) {
            throw new RuntimeException("Section mismatch for student");
        }

        // StandardSubject is source of truth
        var ss = standardSubjectRepository.findById(req.getStandardSubjectId())
                .orElseThrow(() -> new RuntimeException("StandardSubject not found: " + req.getStandardSubjectId()));

        // Ensure student standard matches
        if (st.getStandard() == null || !st.getStandard().equals(ss.getStandard())) {
            throw new RuntimeException("Standard mismatch for student");
        }

        // Ensure selected teacher is actually assigned for this subject + section
        TeacherAssignment ta = teacherAssignmentRepository
                .findByStandardSubject_IdAndSectionAndActiveTrue(req.getStandardSubjectId(), req.getSection())
                .orElseThrow(() -> new RuntimeException("No teacher assigned for this subject/section"));

        if (!ta.getTeacher().getTeacherId().equalsIgnoreCase(req.getTeacherId())) {
            throw new RuntimeException("Selected teacher is not assigned for this subject/section");
        }

        Doubt doubt = Doubt.builder()
                .studentId(req.getStudentId())
                .teacherId(req.getTeacherId())
                .standardSubjectId(req.getStandardSubjectId())
                .standard(ss.getStandard())
                .section(st.getSection())
                .title(req.getTitle().trim())
                .topic(req.getTopic() == null ? null : req.getTopic().trim())
                .description(req.getDescription().trim())
                .status(DoubtStatus.OPEN)
                .teacherViewed(false)
                .studentViewed(true)
                .lastMessageAt(LocalDateTime.now())
                .build();

        doubt = doubtRepository.save(doubt);

        // first message from student (store description also as message)
        doubtMessageRepository.save(DoubtMessage.builder()
                .doubtId(doubt.getId())
                .senderRole("STUDENT")
                .senderId(req.getStudentId())
                .message(req.getDescription().trim())
                .build());

        // 🔔 NOTIFY TEACHER (include student name + subject)
        String subjectName = ss.getSubject() != null ? ss.getSubject().getName() : "Subject";
        String studentName = (st.getFullName() != null && !st.getFullName().isBlank())
                ? st.getFullName()
                : st.getStudentId();

        notificationService.notifyTeacher(
                req.getTeacherId(),
                "New Doubt",
                "Student " + studentName + " asked a doubt in " + subjectName +
                        ". Title: " + req.getTitle().trim(),
                "DOUBT",
                doubt.getId()
        );

        return "Doubt sent successfully. DoubtId=" + doubt.getId();
    }

    public List<DoubtListRow> listMyDoubts(String studentId, DoubtStatus status) {

        if (studentId == null || studentId.isBlank())
            throw new RuntimeException("studentId is required");

        List<Doubt> list = (status == null)
                ? doubtRepository.findByStudentIdOrderByLastMessageAtDesc(studentId)
                : doubtRepository.findByStudentIdAndStatusOrderByLastMessageAtDesc(studentId, status);

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

    public DoubtThreadResponse getThreadAsStudent(Long doubtId, String studentId) {

        Doubt d = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new RuntimeException("Doubt not found: " + doubtId));

        if (!d.getStudentId().equalsIgnoreCase(studentId)) {
            throw new RuntimeException("Not allowed");
        }

        // mark student viewed
        d.setStudentViewed(true);
        d.setStudentViewedAt(LocalDateTime.now());
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

    public String sendMessageAsStudent(Long doubtId, String studentId, SendMessageRequest req) {

        if (req.getMessage() == null || req.getMessage().isBlank())
            throw new RuntimeException("message is required");

        Doubt d = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new RuntimeException("Doubt not found"));

        if (!d.getStudentId().equalsIgnoreCase(studentId))
            throw new RuntimeException("Not allowed");

        doubtMessageRepository.save(DoubtMessage.builder()
                .doubtId(doubtId)
                .senderRole("STUDENT")
                .senderId(studentId)
                .message(req.getMessage().trim())
                .build());

        d.setTeacherViewed(false);
        d.setLastMessageAt(LocalDateTime.now());
        doubtRepository.save(d);

        // 🔔 NOTIFY TEACHER
        notificationService.notifyTeacher(
                d.getTeacherId(),
                "Student Replied",
                "Student " + studentId + " replied to doubt: " + d.getTitle(),
                "DOUBT",
                doubtId
        );

        return "Message sent";
    }
}
