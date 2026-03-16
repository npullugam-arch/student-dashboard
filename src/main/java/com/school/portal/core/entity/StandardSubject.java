package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "standard_subjects",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"standard", "subject_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandardSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer standard;   // 1..10

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private SubjectEntity subject;

    @Column(nullable = false)
    private Boolean active = true;
}