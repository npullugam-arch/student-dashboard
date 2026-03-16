package com.school.portal.notice.service;

import com.school.portal.notice.dto.*;
import com.school.portal.notice.entity.*;
import com.school.portal.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    private static NoticeResponse toDto(Notice n) {
        return NoticeResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .audienceType(n.getAudienceType())
                .classId(n.getClassId())
                .section(n.getSection())
                .publishAt(n.getPublishAt())
                .expireAt(n.getExpireAt())
                .published(n.isPublished())
                .createdBy(n.getCreatedBy())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }

    @Transactional
    public NoticeResponse create(NoticeCreateRequest req, Authentication auth) {
        validateTarget(req.getAudienceType(), req.getClassId(), req.getSection());

        Notice notice = Notice.builder()
                .title(req.getTitle().trim())
                .message(req.getMessage().trim())
                .audienceType(req.getAudienceType())
                .classId(req.getClassId())
                .section(req.getSection() == null ? null : req.getSection().trim().toUpperCase())
                .publishAt(req.getPublishAt())
                .expireAt(req.getExpireAt())
                .published(req.getPublished() != null && req.getPublished())
                .createdBy(auth != null ? auth.getName() : "admin")
                .build();

        return toDto(noticeRepository.save(notice));
    }

    @Transactional
    public NoticeResponse update(Long id, NoticeUpdateRequest req, Authentication auth) {
        validateTarget(req.getAudienceType(), req.getClassId(), req.getSection());

        Notice n = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notice not found: " + id));

        n.setTitle(req.getTitle().trim());
        n.setMessage(req.getMessage().trim());
        n.setAudienceType(req.getAudienceType());
        n.setClassId(req.getClassId());
        n.setSection(req.getSection() == null ? null : req.getSection().trim().toUpperCase());
        n.setPublishAt(req.getPublishAt());
        n.setExpireAt(req.getExpireAt());
        n.setPublished(req.getPublished());
        // keep createdBy, but update time via @PreUpdate
        return toDto(noticeRepository.save(n));
    }

    @Transactional
    public NoticeResponse togglePublish(Long id, boolean published) {
        Notice n = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notice not found: " + id));
        n.setPublished(published);
        return toDto(noticeRepository.save(n));
    }

    @Transactional
    public void delete(Long id) {
        if (!noticeRepository.existsById(id)) {
            throw new IllegalArgumentException("Notice not found: " + id);
        }
        noticeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<NoticeResponse> adminList(String q, Boolean published, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return noticeRepository.adminSearch((q == null || q.isBlank()) ? null : q.trim(), published, pageable)
                .map(NoticeService::toDto);
    }

    @Transactional(readOnly = true)
    public Page<NoticeResponse> viewerList(String role, Integer classId, String section, int page, int size) {
        String r = role == null ? "STUDENT" : role.trim().toUpperCase();
        String sec = (section == null || section.isBlank()) ? null : section.trim().toUpperCase();

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishAt"));

        return noticeRepository.findForViewer(
                        LocalDateTime.now(),
                        r,
                        classId,
                        sec,
                        NoticeAudienceType.ALL,
                        NoticeAudienceType.STUDENTS_ALL,
                        NoticeAudienceType.TEACHERS_ALL,
                        NoticeAudienceType.STUDENTS_CLASS_SECTION,
                        NoticeAudienceType.TEACHERS_CLASS_SECTION,
                        pageable
                )
                .map(NoticeService::toDto);
    }

    private void validateTarget(NoticeAudienceType type, Integer classId, String section) {
        boolean needsTarget = (type == NoticeAudienceType.STUDENTS_CLASS_SECTION || type == NoticeAudienceType.TEACHERS_CLASS_SECTION);
        if (needsTarget) {
            if (classId == null || section == null || section.isBlank()) {
                throw new IllegalArgumentException("classId and section are required for CLASS_SECTION audience.");
            }
        }
    }
}