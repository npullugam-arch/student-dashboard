package com.school.portal.admin.controller;

import com.school.portal.admin.dto.SchoolBrandingRequest;
import com.school.portal.common.dto.SchoolBrandingResponse;
import com.school.portal.core.service.SchoolBrandingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/branding")
public class AdminSchoolBrandingController {

    private final SchoolBrandingService service;

    @GetMapping
    public SchoolBrandingResponse getBranding() {
        return service.getBranding();
    }

    @PutMapping
    public SchoolBrandingResponse updateBranding(
            @RequestBody SchoolBrandingRequest req,
            Authentication auth
    ) {
        String updatedBy = (auth != null ? auth.getName() : "ADMIN");
        return service.upsertBranding(req, updatedBy);
    }
}