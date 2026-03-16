package com.school.portal.common.controller;

import com.school.portal.common.dto.SchoolBrandingResponse;
import com.school.portal.core.service.SchoolBrandingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/branding")
public class SchoolBrandingController {

    private final SchoolBrandingService service;

    @GetMapping
    public SchoolBrandingResponse getBranding() {
        return service.getBranding();
    }
}