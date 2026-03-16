package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "timetables",
        uniqueConstraints = @UniqueConstraint(name = "uk_timetable_class", columnNames = {"standard", "section"})
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer standard;

    @Column(nullable = false, length = 5)
    private String section;

    @OneToMany(mappedBy = "timetable", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("slotOrder ASC")
    @Builder.Default
    private List<TimetableSlot> slots = new ArrayList<>();
}
