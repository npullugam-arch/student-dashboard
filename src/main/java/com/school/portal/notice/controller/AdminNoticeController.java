package com.school.portal.notice.controller;

import com.school.portal.notice.dto.*;
import com.school.portal.notice.service.NoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/notices")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNoticeController {

    private final NoticeService noticeService;

    @PostMapping
    public NoticeResponse create(@Valid @RequestBody NoticeCreateRequest req, Authentication auth) {
        return noticeService.create(req, auth);
    }

    @GetMapping
    public Page<NoticeResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean published,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return noticeService.adminList(q, published, page, size);
    }

    @PutMapping("/{id}")
    public NoticeResponse update(@PathVariable Long id,
                                 @Valid @RequestBody NoticeUpdateRequest req,
                                 Authentication auth) {
        return noticeService.update(id, req, auth);
    }

    @PatchMapping("/{id}/publish")
    public NoticeResponse publish(@PathVariable Long id, @RequestParam boolean value) {
        return noticeService.togglePublish(id, value);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        noticeService.delete(id);
    }
}