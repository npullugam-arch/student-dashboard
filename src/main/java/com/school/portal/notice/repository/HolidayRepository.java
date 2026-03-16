package com.school.portal.notice.repository;

import com.school.portal.notice.entity.Holiday;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {

    @Query("""
        SELECT h FROM Holiday h
        WHERE h.active = true
          AND (h.endDate IS NULL AND h.startDate >= :today
               OR h.endDate IS NOT NULL AND h.endDate >= :today)
        ORDER BY h.startDate ASC
    """)
    List<Holiday> findUpcoming(@Param("today") LocalDate today);

    @Query("""
        SELECT h FROM Holiday h
        WHERE h.active = true
          AND h.startDate >= :start
          AND h.startDate <= :end
        ORDER BY h.startDate ASC
    """)
    List<Holiday> findByYear(@Param("start") LocalDate start,
                             @Param("end") LocalDate end);
}