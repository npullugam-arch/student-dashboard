package com.school.portal.notice.service;

import com.school.portal.notice.dto.*;
import com.school.portal.notice.entity.Holiday;
import com.school.portal.notice.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HolidayService {

    private final HolidayRepository holidayRepository;

    private static HolidayResponse toDto(Holiday h) {
        return HolidayResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .startDate(h.getStartDate())
                .endDate(h.getEndDate())
                .description(h.getDescription())
                .active(h.isActive())
                .createdBy(h.getCreatedBy())
                .createdAt(h.getCreatedAt())
                .updatedAt(h.getUpdatedAt())
                .build();
    }

    @Transactional
    public HolidayResponse create(HolidayCreateRequest req, Authentication auth) {
        validateDates(req.getStartDate(), req.getEndDate());

        Holiday h = Holiday.builder()
                .name(req.getName().trim())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .description(req.getDescription() == null ? null : req.getDescription().trim())
                .active(req.getActive() == null || req.getActive())
                .createdBy(auth != null ? auth.getName() : "admin")
                .build();

        return toDto(holidayRepository.save(h));
    }

    @Transactional
    public HolidayResponse update(Long id, HolidayUpdateRequest req) {
        validateDates(req.getStartDate(), req.getEndDate());

        Holiday h = holidayRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Holiday not found: " + id));

        h.setName(req.getName().trim());
        h.setStartDate(req.getStartDate());
        h.setEndDate(req.getEndDate());
        h.setDescription(req.getDescription() == null ? null : req.getDescription().trim());
        h.setActive(req.getActive());

        return toDto(holidayRepository.save(h));
    }

    @Transactional
    public HolidayResponse toggleActive(Long id, boolean active) {
        Holiday h = holidayRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Holiday not found: " + id));
        h.setActive(active);
        return toDto(holidayRepository.save(h));
    }

    @Transactional
    public void delete(Long id) {
        if (!holidayRepository.existsById(id)) {
            throw new IllegalArgumentException("Holiday not found: " + id);
        }
        holidayRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<HolidayResponse> upcoming(int limit) {
        var list = holidayRepository.findUpcoming(LocalDate.now());
        return list.stream().limit(Math.max(1, limit)).map(HolidayService::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<HolidayResponse> year(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return holidayRepository.findByYear(start, end).stream().map(HolidayService::toDto).toList();
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (start == null) throw new IllegalArgumentException("startDate is required");
        if (end != null && end.isBefore(start)) throw new IllegalArgumentException("endDate cannot be before startDate");
    }
}