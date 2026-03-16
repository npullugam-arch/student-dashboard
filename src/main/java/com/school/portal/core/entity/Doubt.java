package com.school.portal.core.entity;

import com.school.portal.common.enums.DoubtStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "doubts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Doubt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Student reference (your Student.studentId like S1001)
    @Column(nullable = false, length = 30)
    private String studentId;

    // Teacher assigned automatically (or chosen by student)
    @Column(nullable = false, length = 30)
    private String teacherId;

    // StandardSubject mapping id (standard_subjects.id)
    @Column(nullable = false)
    private Long standardSubjectId;

    @Column(nullable = false)
    private Integer standard;

    @Column(nullable = false, length = 5)
    private String section;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 120)
    private String topic;

    @Column(nullable = false, length = 4000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DoubtStatus status;

    // "Viewed" indicators
    @Column(nullable = false)
    private boolean teacherViewed;

    @Column(nullable = false)
    private boolean studentViewed;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastMessageAt;
    private LocalDateTime teacherViewedAt;
    private LocalDateTime studentViewedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        lastMessageAt = now;
        if (status == null) status = DoubtStatus.OPEN;
        // when student creates -> student viewed yes, teacher not viewed
        studentViewed = true;
        teacherViewed = false;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
