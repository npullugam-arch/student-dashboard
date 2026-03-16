package com.school.portal.teacher.controller;

import com.school.portal.notifications.NotificationService;
import com.school.portal.notifications.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher/api/notifications")
@RequiredArgsConstructor
public class TeacherNotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{teacherId}")
    public List<NotificationDto> latest(@PathVariable String teacherId) {
        return notificationService.latest("TEACHER", teacherId);
    }

    @GetMapping("/{teacherId}/unread-count")
    public long unreadCount(@PathVariable String teacherId) {
        return notificationService.unreadCount("TEACHER", teacherId);
    }

    @PostMapping("/{teacherId}/{notifId}/read")
    public void markRead(@PathVariable String teacherId, @PathVariable Long notifId) {
        notificationService.markRead("TEACHER", teacherId, notifId);
    }
}
