package com.school.portal.student.controller;

import com.school.portal.notifications.NotificationService;
import com.school.portal.notifications.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student/api/notifications")
@RequiredArgsConstructor
public class StudentNotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{studentId}")
    public List<NotificationDto> latest(@PathVariable String studentId) {
        return notificationService.latest("STUDENT", studentId);
    }

    @GetMapping("/{studentId}/unread-count")
    public long unreadCount(@PathVariable String studentId) {
        return notificationService.unreadCount("STUDENT", studentId);
    }

    @PostMapping("/{studentId}/{notifId}/read")
    public void markRead(@PathVariable String studentId, @PathVariable Long notifId) {
        notificationService.markRead("STUDENT", studentId, notifId);
    }
}
