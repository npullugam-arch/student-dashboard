package com.school.portal.core.entity;

import com.school.portal.common.enums.DayName;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timetable_entries",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_tt_cell",
                columnNames = {"slot_id", "day_name"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private TimetableSlot slot;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_name", nullable = false, length = 15)
    private DayName dayName;

    @Column(name = "subject_name", nullable = false, length = 80)
    private String subjectName;
}
