package com.school.portal.notice.controller;

import com.school.portal.notice.dto.*;
import com.school.portal.notice.service.HolidayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/holidays")
@PreAuthorize("hasRole('ADMIN')")
public class AdminHolidayController {

    private final HolidayService holidayService;

    @PostMapping
    public HolidayResponse create(@Valid @RequestBody HolidayCreateRequest req, Authentication auth) {
        return holidayService.create(req, auth);
    }

    @PutMapping("/{id}")
    public HolidayResponse update(@PathVariable Long id, @Valid @RequestBody HolidayUpdateRequest req) {
        return holidayService.update(id, req);
    }

    @PatchMapping("/{id}/active")
    public HolidayResponse active(@PathVariable Long id, @RequestParam boolean value) {
        return holidayService.toggleActive(id, value);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        holidayService.delete(id);
    }
}