package com.school.portal.core.service;

import com.school.portal.admin.dto.SchoolBrandingRequest;
import com.school.portal.common.dto.SchoolBrandingResponse;
import com.school.portal.core.entity.SchoolBranding;
import com.school.portal.core.repository.SchoolBrandingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SchoolBrandingService {

    private static final long SINGLE_ROW_ID = 1L;

    private final SchoolBrandingRepository repo;

    @Transactional(readOnly = true)
    public SchoolBrandingResponse getBranding() {
        SchoolBranding b = repo.findById(SINGLE_ROW_ID)
                .orElseGet(() -> defaultBranding());

        return SchoolBrandingResponse.builder()
                .schoolName(b.getSchoolName())
                .logoUrl(b.getLogoUrl())
                .updatedAt(b.getUpdatedAt())
                .build();
    }

    @Transactional
    public SchoolBrandingResponse upsertBranding(SchoolBrandingRequest req, String updatedBy) {
        String schoolName = req.getSchoolName() == null ? "" : req.getSchoolName().trim();
        String logoUrl = req.getLogoUrl() == null ? "" : req.getLogoUrl().trim();

        if (schoolName.isBlank()) {
            throw new IllegalArgumentException("School name is required");
        }

        SchoolBranding b = repo.findById(SINGLE_ROW_ID)
                .orElse(SchoolBranding.builder()
                        .id(SINGLE_ROW_ID)
                        .build());

        b.setSchoolName(schoolName);
        b.setLogoUrl(logoUrl.isBlank() ? null : logoUrl);
        b.setUpdatedBy(updatedBy);

        SchoolBranding saved = repo.save(b);

        return SchoolBrandingResponse.builder()
                .schoolName(saved.getSchoolName())
                .logoUrl(saved.getLogoUrl())
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    private SchoolBranding defaultBranding() {
        // Not saving automatically to avoid unwanted DB writes.
        // Admin will save once from portal.
        return SchoolBranding.builder()
                .id(SINGLE_ROW_ID)
                .schoolName("EduConnect School")
                .logoUrl(null)
                .build();
    }
}