package com.school.portal.notes.service;

import com.school.portal.core.entity.ShortNote;
import com.school.portal.core.entity.Student;
import com.school.portal.core.entity.Teacher;
import com.school.portal.core.repository.ShortNoteRepository;
import com.school.portal.core.repository.StudentCoreRepository;
import com.school.portal.admin.repository.TeacherRepository;
import com.school.portal.notes.dto.ShortNoteDto;
import com.school.portal.notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherShortNoteService {

    private final ShortNoteRepository shortNoteRepository;
    private final NoteFileStorageService storageService;

    // ✅ NEW
    private final StudentCoreRepository studentCoreRepository;
    private final NotificationService notificationService;
    private final TeacherRepository teacherRepository;

    public ShortNoteDto upload(String teacherId,
                               Integer standard,
                               String section,
                               String title,
                               String topic,
                               MultipartFile pdf) {

        if (teacherId == null || teacherId.isBlank())
            throw new RuntimeException("teacherId is required");
        if (standard == null)
            throw new RuntimeException("standard is required");
        if (section == null || section.isBlank())
            throw new RuntimeException("section is required");
        if (title == null || title.isBlank())
            throw new RuntimeException("title is required");

        String sec = section.trim().toUpperCase();

        String fileUrl = storageService.savePdf(pdf, teacherId, standard, sec);

        ShortNote note = ShortNote.builder()
                .teacherId(teacherId.trim())
                .standard(standard)
                .section(sec)
                .title(title.trim())
                .topic(topic == null ? null : topic.trim())
                .fileUrl(fileUrl)
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();

        // ✅ Save FIRST
        ShortNote saved = shortNoteRepository.save(note);

        // ===============================
        // 🔔 PROFESSIONAL NOTIFICATION
        // ===============================
        try {

            // Get teacher name
            Teacher teacher = teacherRepository.findByTeacherId(teacherId)
                    .orElse(null);

            String teacherName = (teacher != null && teacher.getFullName() != null)
                    ? teacher.getFullName()
                    : teacherId;

            // If topic exists, treat as subject display
            String subjectDisplay = (topic != null && !topic.isBlank())
                    ? topic.trim()
                    : "General";

            List<Student> students =
                    studentCoreRepository.findByStandardAndSection(standard, sec);

            for (Student s : students) {

                if (s == null || s.getStudentId() == null || s.getStudentId().isBlank())
                    continue;

                notificationService.notifyStudent(
                        s.getStudentId(),
                        "New Short Note – " + subjectDisplay,
                        teacherName + " uploaded \"" + title.trim() + "\" for Class "
                                + standard + "-" + sec,
                        "NOTES",
                        saved.getId()
                );
            }

            System.out.println("✅ Short note notifications sent to "
                    + students.size() + " students for "
                    + standard + "-" + sec);

        } catch (Exception ex) {
            System.out.println("⚠ Notification failed but note saved. Reason: "
                    + ex.getMessage());
        }

        return toDto(saved);
    }

    public List<ShortNoteDto> myNotes(String teacherId) {
        return shortNoteRepository
                .findByTeacherIdAndActiveTrueOrderByCreatedAtDesc(teacherId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public String deleteMyNote(String teacherId, Long noteId) {
        ShortNote n = shortNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found: " + noteId));

        if (!n.getTeacherId().equals(teacherId))
            throw new RuntimeException("Not allowed");

        n.setActive(false);
        shortNoteRepository.save(n);
        return "Deleted note: " + noteId;
    }

    private ShortNoteDto toDto(ShortNote n) {
        return ShortNoteDto.builder()
                .id(n.getId())
                .teacherId(n.getTeacherId())
                .standard(n.getStandard())
                .section(n.getSection())
                .title(n.getTitle())
                .topic(n.getTopic())
                .fileUrl(n.getFileUrl())
                .createdAt(n.getCreatedAt() == null ? null : n.getCreatedAt().toString())
                .build();
    }
}
