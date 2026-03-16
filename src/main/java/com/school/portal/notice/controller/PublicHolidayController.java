package com.school.portal.notice.controller;

import com.school.portal.notice.dto.HolidayResponse;
import com.school.portal.notice.service.HolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/holidays")
@PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
public class PublicHolidayController {

    private final HolidayService holidayService;

    @GetMapping("/upcoming")
    public List<HolidayResponse> upcoming(@RequestParam(defaultValue = "10") int limit) {
        return holidayService.upcoming(limit);
    }

    @GetMapping("/year/{year}")
    public List<HolidayResponse> year(@PathVariable int year) {
        return holidayService.year(year);
    }
}