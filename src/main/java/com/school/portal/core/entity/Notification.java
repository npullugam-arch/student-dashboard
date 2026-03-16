package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_recipient", columnList = "recipient_role, recipient_id, created_at"),
        @Index(name = "idx_notif_unread", columnList = "recipient_role, recipient_id, read_flag")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ NEW: required by your DB table (NOT NULL)
    @Column(name="receiver_role", nullable = false, length = 20)
    private String receiverRole;

    // ✅ NEW: required by your DB table (NOT NULL)
    @Column(name="receiver_id", nullable = false, length = 30)
    private String receiverId;

    @Column(name="recipient_role", nullable = false, length = 20)
    private String recipientRole;

    @Column(name="recipient_id", nullable = false, length = 30)
    private String recipientId;

    @Column(name="title", nullable = false, length = 120)
    private String title;

    @Column(name="message", nullable = false, length = 600)
    private String message;

    @Column(name="type", nullable = false, length = 30)
    private String type;

    @Column(name="ref_id")
    private Long refId;

    @Column(name="read_flag", nullable = false)
    private boolean readFlag;

    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt;
}
