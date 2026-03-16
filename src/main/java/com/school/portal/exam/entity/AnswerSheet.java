package com.school.portal.exam.entity;

import com.school.portal.core.entity.Student;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "answer_sheets",
        uniqueConstraints = {
                // one pdf per exam+student+subject (replace allowed)
                @UniqueConstraint(columnNames = {"exam_id", "student_id", "subject_name"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "subject_name", nullable = false, length = 80)
    private String subjectName;

    @Column(nullable = false, length = 200)
    private String originalFileName;

    @Column(nullable = false, length = 200)
    private String storedFileName;

    @Column(nullable = false, length = 200)
    private String storagePath;

    @Column(nullable = false, length = 60)
    private String contentType;

    @Column(nullable = false)
    private Long sizeBytes;

    @Column(nullable = false, length = 30)
    private String uploadedByTeacherId;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;
}
