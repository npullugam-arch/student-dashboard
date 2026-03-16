package com.school.portal.notifications;

import com.school.portal.core.entity.Notification;
import com.school.portal.core.repository.NotificationRepository;
import com.school.portal.notifications.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void notifyTeacher(String teacherId, String title, String message, String type, Long refId) {
        createAndPush("TEACHER", teacherId, title, message, type, refId);
    }

    public void notifyStudent(String studentId, String title, String message, String type, Long refId) {
        createAndPush("STUDENT", studentId, title, message, type, refId);
    }

    private void createAndPush(String role, String recipientId, String title, String message, String type, Long refId) {

        System.out.println("🔔 NOTIF: Saving to DB -> role=" + role + ", id=" + recipientId);

        Notification saved = notificationRepository.save(
                Notification.builder()
                        // ✅ MUST FILL THESE because DB has NOT NULL
                        .receiverRole(role)
                        .receiverId(recipientId)

                        // ✅ keep your existing columns too
                        .recipientRole(role)
                        .recipientId(recipientId)

                        .title(title)
                        .message(message)
                        .type(type)
                        .refId(refId)
                        .readFlag(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        System.out.println("✅ NOTIF: Saved. notifId=" + saved.getId());

        // ✅ WS push should NEVER break DB insert
        try {
            NotificationDto dto = toDto(saved);
            String topic = "/topic/notifications/" + role + "/" + recipientId;
            messagingTemplate.convertAndSend(topic, dto);
            System.out.println("📡 NOTIF: WS pushed -> " + topic);
        } catch (Exception ex) {
            System.out.println("⚠ NOTIF: WS push failed (DB saved). Reason: " + ex.getMessage());
        }
    }

    public List<NotificationDto> latest(String role, String id) {
        return notificationRepository
                .findTop50ByRecipientRoleAndRecipientIdOrderByCreatedAtDesc(role, id)
                .stream().map(this::toDto).toList();
    }

    public long unreadCount(String role, String id) {
        return notificationRepository.countByRecipientRoleAndRecipientIdAndReadFlagFalse(role, id);
    }

    public void markRead(String role, String id, Long notifId) {
        Notification n = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notifId));

        if (!role.equalsIgnoreCase(n.getRecipientRole()) || !id.equalsIgnoreCase(n.getRecipientId())) {
            throw new RuntimeException("Not allowed to mark this notification");
        }

        n.setReadFlag(true);
        notificationRepository.save(n);
    }

    // ✅ NEW: delete one notification from DB
    public void deleteOne(String role, String id, Long notifId) {
        // safest: ensure it belongs to role+id using deleteBy...
        long deleted = notificationRepository.deleteByRecipientRoleAndRecipientIdAndId(role, id, notifId);
        if (deleted == 0) {
            // either not found or not allowed
            throw new RuntimeException("Not allowed or notification not found: " + notifId);
        }
    }

    // ✅ NEW: delete all notifications for this role+id
    public long deleteAll(String role, String id) {
        return notificationRepository.deleteByRecipientRoleAndRecipientId(role, id);
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .refId(n.getRefId())
                .read(n.isReadFlag())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
