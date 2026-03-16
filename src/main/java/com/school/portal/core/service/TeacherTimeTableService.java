package com.school.portal.core.service;

import com.school.portal.admin.repository.StandardSubjectRepository;
import com.school.portal.common.dto.TeacherTimeTableSlotRequest;
import com.school.portal.common.dto.TeacherTimeTableSlotResponse;
import com.school.portal.common.dto.TeacherTodayScheduleResponse;
import com.school.portal.core.entity.StandardSubject;
import com.school.portal.core.entity.SubjectEntity;
import com.school.portal.core.entity.TeacherTimeTableSlot;
import com.school.portal.core.repository.TeacherTimeTableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherTimeTableService {

    private final TeacherTimeTableSlotRepository repo;
    private final StandardSubjectRepository standardSubjectRepository;

    private DayOfWeek parseDay(String s) {
        try { return DayOfWeek.valueOf(String.valueOf(s).trim().toUpperCase()); }
        catch (Exception e) { throw new RuntimeException("Invalid dayOfWeek: " + s); }
    }

    private LocalTime parseTime(String s) {
        try { return LocalTime.parse(String.valueOf(s).trim()); }
        catch (Exception e) { throw new RuntimeException("Invalid time format (use HH:mm): " + s); }
    }

    private String normSection(String s) {
        return String.valueOf(s == null ? "" : s).trim().toUpperCase();
    }

    private void validateRequest(TeacherTimeTableSlotRequest r) {
        if (r.getDayOfWeek() == null || r.getDayOfWeek().trim().isEmpty()) throw new RuntimeException("dayOfWeek is required");
        if (r.getStartTime() == null || r.getStartTime().trim().isEmpty()) throw new RuntimeException("startTime is required");
        if (r.getEndTime() == null || r.getEndTime().trim().isEmpty()) throw new RuntimeException("endTime is required");
        if (r.getStandard() == null) throw new RuntimeException("standard is required");
        if (r.getSection() == null || r.getSection().trim().isEmpty()) throw new RuntimeException("section is required");
        if (r.getStandardSubjectId() == null) throw new RuntimeException("standardSubjectId is required");

        if (r.getStandard() < -2 || r.getStandard() > 12) throw new RuntimeException("standard must be between -2 and 12");

        LocalTime st = parseTime(r.getStartTime());
        LocalTime et = parseTime(r.getEndTime());
        if (!et.isAfter(st)) throw new RuntimeException("endTime must be after startTime");
    }

    private void validateNoOverlap(String teacherId, DayOfWeek day, LocalTime st, LocalTime et, Long ignoreId) {
        List<TeacherTimeTableSlot> existing = repo.findByTeacherIdAndDayOfWeekOrderByStartTimeAsc(teacherId, day);
        for (TeacherTimeTableSlot x : existing) {
            if (!x.isActive()) continue;
            if (ignoreId != null && ignoreId.equals(x.getId())) continue;

            // Overlap: st < x.end AND et > x.start
            boolean overlap = st.isBefore(x.getEndTime()) && et.isAfter(x.getStartTime());
            if (overlap) {
                throw new RuntimeException("Time overlaps with existing slot: " +
                        x.getStartTime() + "-" + x.getEndTime() + " (Class " + x.getStandard() + "-" + x.getSection() + ")");
            }
        }
    }

    private TeacherTimeTableSlotResponse toResponse(TeacherTimeTableSlot e) {
        String subjectName = null;

        try {
            StandardSubject ss = standardSubjectRepository.findById(e.getStandardSubjectId()).orElse(null);
            if (ss != null) {
                SubjectEntity subj = ss.getSubject(); // ✅ IMPORTANT FIX
                if (subj != null) subjectName = subj.getName();
            }
        } catch (Exception ignored) {}

        return TeacherTimeTableSlotResponse.builder()
                .id(e.getId())
                .teacherId(e.getTeacherId())
                .dayOfWeek(e.getDayOfWeek().name())
                .startTime(e.getStartTime().toString())
                .endTime(e.getEndTime().toString())
                .standard(e.getStandard())
                .section(e.getSection())
                .standardSubjectId(e.getStandardSubjectId())
                .subjectName(subjectName)
                .active(e.isActive())
                .build();
    }

    @Transactional
    public TeacherTimeTableSlotResponse create(String teacherId, TeacherTimeTableSlotRequest r) {
        validateRequest(r);

        DayOfWeek day = parseDay(r.getDayOfWeek());
        LocalTime st = parseTime(r.getStartTime());
        LocalTime et = parseTime(r.getEndTime());
        String section = normSection(r.getSection());

        // ✅ Validate subject belongs to given standard
        StandardSubject ss = standardSubjectRepository.findById(r.getStandardSubjectId())
                .orElseThrow(() -> new RuntimeException("StandardSubject not found: " + r.getStandardSubjectId()));
        if (!ss.getStandard().equals(r.getStandard())) {
            throw new RuntimeException("Selected subject does not belong to standard: " + r.getStandard());
        }

        validateNoOverlap(teacherId, day, st, et, null);

        TeacherTimeTableSlot slot = TeacherTimeTableSlot.builder()
                .teacherId(teacherId)
                .dayOfWeek(day)
                .startTime(st)
                .endTime(et)
                .standard(r.getStandard())
                .section(section)
                .standardSubjectId(r.getStandardSubjectId())
                .active(r.getActive() == null || r.getActive())
                .build();

        TeacherTimeTableSlot saved = repo.save(slot);
        return toResponse(saved);
    }

    @Transactional
    public TeacherTimeTableSlotResponse update(String teacherId, Long slotId, TeacherTimeTableSlotRequest r) {
        validateRequest(r);

        TeacherTimeTableSlot slot = repo.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));

        if (!slot.getTeacherId().equals(teacherId)) {
            throw new RuntimeException("Slot does not belong to teacher: " + teacherId);
        }

        DayOfWeek day = parseDay(r.getDayOfWeek());
        LocalTime st = parseTime(r.getStartTime());
        LocalTime et = parseTime(r.getEndTime());
        String section = normSection(r.getSection());

        StandardSubject ss = standardSubjectRepository.findById(r.getStandardSubjectId())
                .orElseThrow(() -> new RuntimeException("StandardSubject not found: " + r.getStandardSubjectId()));
        if (!ss.getStandard().equals(r.getStandard())) {
            throw new RuntimeException("Selected subject does not belong to standard: " + r.getStandard());
        }

        validateNoOverlap(teacherId, day, st, et, slotId);

        slot.setDayOfWeek(day);
        slot.setStartTime(st);
        slot.setEndTime(et);
        slot.setStandard(r.getStandard());
        slot.setSection(section);
        slot.setStandardSubjectId(r.getStandardSubjectId());
        slot.setActive(r.getActive() == null || r.getActive());

        TeacherTimeTableSlot saved = repo.save(slot);
        return toResponse(saved);
    }

    @Transactional
    public void delete(String teacherId, Long slotId) {
        TeacherTimeTableSlot slot = repo.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));
        if (!slot.getTeacherId().equals(teacherId)) {
            throw new RuntimeException("Slot does not belong to teacher: " + teacherId);
        }
        repo.delete(slot);
    }

    public List<TeacherTimeTableSlotResponse> listForTeacherDay(String teacherId, String dayOfWeek) {
        DayOfWeek day = parseDay(dayOfWeek);
        return repo.findByTeacherIdAndDayOfWeekOrderByStartTimeAsc(teacherId, day)
                .stream().map(this::toResponse).toList();
    }

    public TeacherTodayScheduleResponse todayForTeacher(String teacherId) {
        LocalDate today = LocalDate.now();
        DayOfWeek day = today.getDayOfWeek();

        List<TeacherTimeTableSlotResponse> slots =
                repo.findByTeacherIdAndDayOfWeekAndActiveTrueOrderByStartTimeAsc(teacherId, day)
                        .stream().map(this::toResponse).toList();

        return TeacherTodayScheduleResponse.builder()
                .date(today.toString())
                .dayOfWeek(day.name())
                .slots(slots)
                .build();
    }
}