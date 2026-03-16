package com.school.portal.core.repository;

import com.school.portal.core.entity.TeacherTimeTableSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface TeacherTimeTableSlotRepository extends JpaRepository<TeacherTimeTableSlot, Long> {

    List<TeacherTimeTableSlot> findByTeacherIdAndDayOfWeekAndActiveTrueOrderByStartTimeAsc(String teacherId, DayOfWeek dayOfWeek);

    List<TeacherTimeTableSlot> findByTeacherIdAndDayOfWeekOrderByStartTimeAsc(String teacherId, DayOfWeek dayOfWeek);
}