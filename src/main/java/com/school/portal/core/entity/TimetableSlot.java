package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "timetable_slots",
        indexes = {
                @Index(name = "idx_tt_slot_tt", columnList = "timetable_id, slot_order")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TimetableSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_id", nullable = false)
    private Timetable timetable;

    @Column(name = "slot_order", nullable = false)
    private Integer slotOrder;

    @Column(name = "start_time", nullable = false, length = 10)
    private String startTime; // "09:00"

    @Column(name = "end_time", nullable = false, length = 10)
    private String endTime;   // "09:45"

    @OneToMany(mappedBy = "slot", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TimetableEntry> entries = new ArrayList<>();
}
