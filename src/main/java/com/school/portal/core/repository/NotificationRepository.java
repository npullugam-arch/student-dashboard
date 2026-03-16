package com.school.portal.core.repository;

import com.school.portal.core.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop50ByRecipientRoleAndRecipientIdOrderByCreatedAtDesc(String role, String id);

    long countByRecipientRoleAndRecipientIdAndReadFlagFalse(String role, String id);

    // ✅ NEW
    @Modifying
    @Transactional
    long deleteByRecipientRoleAndRecipientIdAndId(String role, String id, Long notifId);

    // ✅ NEW
    @Modifying
    @Transactional
    long deleteByRecipientRoleAndRecipientId(String role, String id);
}
