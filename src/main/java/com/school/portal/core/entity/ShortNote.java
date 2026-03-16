package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "short_notes",
        indexes = {
                @Index(name = "idx_notes_std_sec", columnList = "standard,section,active"),
                @Index(name = "idx_notes_created_at", columnList = "createdAt")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // who uploaded
    @Column(nullable = false, length = 30)
    private String teacherId;

    @Column(nullable = false)
    private Integer standard;

    @Column(nullable = false, length = 5)
    private String section; // A/B/C

    @Column(nullable = false, length = 160)
    private String title;

    @Column(length = 160)
    private String topic;

    // stored pdf url like /uploads/notes/xxx.pdf
    @Column(nullable = false, length = 700)
    private String fileUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean active = true;
}
