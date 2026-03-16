package com.school.portal.notice.controller;

import com.school.portal.notice.dto.NoticeResponse;
import com.school.portal.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notices")
@PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
public class PublicNoticeController {

    private final NoticeService noticeService;

    // IMPORTANT: role comes from auth, classId/section from sessionStorage can be passed
    @GetMapping("/me")
    public Page<NoticeResponse> myNotices(
            Authentication auth,
            @RequestParam(required = false) Integer classId,
            @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String role = auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .filter(r -> r.startsWith("ROLE_"))
                .map(r -> r.replace("ROLE_", ""))
                .findFirst()
                .orElse("STUDENT");

        return noticeService.viewerList(role, classId, section, page, size);
    }
}