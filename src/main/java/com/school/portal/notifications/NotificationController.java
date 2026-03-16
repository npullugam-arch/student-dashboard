package com.school.portal.notifications;

import com.school.portal.notifications.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{role}/{id}")
    public List<NotificationDto> latest(@PathVariable String role, @PathVariable String id) {
        return notificationService.latest(role.toUpperCase(), id);
    }

    @GetMapping("/{role}/{id}/unread-count")
    public long unreadCount(@PathVariable String role, @PathVariable String id) {
        return notificationService.unreadCount(role.toUpperCase(), id);
    }

    @PostMapping("/{role}/{id}/{notifId}/read")
    public void markRead(@PathVariable String role, @PathVariable String id, @PathVariable Long notifId) {
        notificationService.markRead(role.toUpperCase(), id, notifId);
    }

    // ✅ NEW: Clear ONE (delete from DB)
    @DeleteMapping("/{role}/{id}/{notifId}")
    public void deleteOne(@PathVariable String role, @PathVariable String id, @PathVariable Long notifId) {
        notificationService.deleteOne(role.toUpperCase(), id, notifId);
    }

    // ✅ NEW: Clear ALL (delete from DB)
    @DeleteMapping("/{role}/{id}/clear-all")
    public long clearAll(@PathVariable String role, @PathVariable String id) {
        return notificationService.deleteAll(role.toUpperCase(), id);
    }
}
