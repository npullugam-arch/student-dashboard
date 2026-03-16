package com.school.portal.notice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notices")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 5000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private NoticeAudienceType audienceType;

    // For class+section targeting (nullable unless *_CLASS_SECTION)
    private Integer classId;

    @Column(length = 10)
    private String section;

    @Column(nullable = false)
    private LocalDateTime publishAt;

    private LocalDateTime expireAt;

    @Column(nullable = false)
    private boolean published;

    // simple audit
    @Column(length = 80)
    private String createdBy;  // username/email
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}