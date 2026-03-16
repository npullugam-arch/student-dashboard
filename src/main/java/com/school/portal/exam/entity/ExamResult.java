package com.school.portal.exam.entity;

import com.school.portal.core.entity.Student;
import com.school.portal.exam.entity.Exam;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_results",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"exam_id", "student_id", "subject_name"})
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Exam reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    // Student reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 80)
    private String subjectName;

    @Column(nullable = false)
    private Integer marksObtained;

    @Column(nullable = false)
    private Integer totalMarks;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
