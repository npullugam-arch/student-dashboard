package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "doubt_messages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DoubtMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long doubtId;

    @Column(nullable = false, length = 15)
    private String senderRole; // STUDENT / TEACHER

    @Column(nullable = false, length = 30)
    private String senderId;   // studentId or teacherId

    @Column(nullable = false, length = 4000)
    private String message;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
