package com.school.portal.timetable;

import com.school.portal.admin.dto.TimetableSaveRequest;
import com.school.portal.admin.dto.TimetableSlotDto;
import com.school.portal.common.enums.DayName;
import com.school.portal.core.entity.Timetable;
import com.school.portal.core.entity.TimetableEntry;
import com.school.portal.core.entity.TimetableSlot;
import com.school.portal.core.repository.TimetableRepository;
import com.school.portal.student.dto.TimetableViewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableRepository timetableRepository;

    private static final List<String> DAYS = List.of(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"
    );

    @Transactional
    public String saveOrUpdate(TimetableSaveRequest req) {
        if (req.getStandard() == null) throw new RuntimeException("standard is required");
        if (req.getSection() == null || req.getSection().isBlank()) throw new RuntimeException("section is required");
        if (req.getSlots() == null) req.setSlots(List.of());

        String sec = req.getSection().trim().toUpperCase();

        Timetable tt = timetableRepository.findByStandardAndSection(req.getStandard(), sec)
                .orElseGet(() -> Timetable.builder()
                        .standard(req.getStandard())
                        .section(sec)
                        .build()
                );

        // Clear old (orphanRemoval will delete old rows)
        tt.getSlots().clear();

        // Recreate from request
        List<TimetableSlot> newSlots = new ArrayList<>();

        for (TimetableSlotDto s : req.getSlots()) {
            if (s.getSlotOrder() == null) throw new RuntimeException("slotOrder is required");
            if (s.getStartTime() == null || s.getStartTime().isBlank()) throw new RuntimeException("startTime is required");
            if (s.getEndTime() == null || s.getEndTime().isBlank()) throw new RuntimeException("endTime is required");

            TimetableSlot slot = TimetableSlot.builder()
                    .timetable(tt)
                    .slotOrder(s.getSlotOrder())
                    .startTime(s.getStartTime().trim())
                    .endTime(s.getEndTime().trim())
                    .build();

            Map<String, String> m = (s.getSubjectsByDay() == null) ? new HashMap<>() : s.getSubjectsByDay();
            List<TimetableEntry> entries = new ArrayList<>();

            for (String dayKey : DAYS) {
                String val = m.get(dayKey);
                if (val == null || val.trim().isEmpty()) val = "—"; // keep cell non-null
                entries.add(TimetableEntry.builder()
                        .slot(slot)
                        .dayName(DayName.valueOf(dayKey))
                        .subjectName(val.trim())
                        .build());
            }

            slot.setEntries(entries);
            newSlots.add(slot);
        }

        tt.getSlots().addAll(newSlots);
        timetableRepository.save(tt);

        return "Timetable saved successfully ✅";
    }

    @Transactional(readOnly = true)
    public TimetableViewResponse view(Integer standard, String section) {
        if (standard == null) throw new RuntimeException("standard is required");
        if (section == null || section.isBlank()) throw new RuntimeException("section is required");

        String sec = section.trim().toUpperCase();

        Timetable tt = timetableRepository.findByStandardAndSection(standard, sec)
                .orElse(null);

        if (tt == null) {
            return TimetableViewResponse.builder()
                    .standard(standard)
                    .section(sec)
                    .days(DAYS)
                    .rows(List.of())
                    .build();
        }

        List<TimetableViewResponse.Row> rows = new ArrayList<>();

        tt.getSlots().sort(Comparator.comparing(TimetableSlot::getSlotOrder));

        for (TimetableSlot slot : tt.getSlots()) {
            Map<String, String> map = new LinkedHashMap<>();
            for (String d : DAYS) map.put(d, "—");

            if (slot.getEntries() != null) {
                for (TimetableEntry e : slot.getEntries()) {
                    map.put(e.getDayName().name(), e.getSubjectName());
                }
            }

            rows.add(TimetableViewResponse.Row.builder()
                    .slotOrder(slot.getSlotOrder())
                    .startTime(slot.getStartTime())
                    .endTime(slot.getEndTime())
                    .subjectsByDay(map)
                    .build());
        }

        return TimetableViewResponse.builder()
                .standard(tt.getStandard())
                .section(tt.getSection())
                .days(DAYS)
                .rows(rows)
                .build();
    }
}
