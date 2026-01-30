package com.school.portal.core.entity;

import com.school.portal.common.enums.Subject;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "teacher_assignments",
        uniqueConstraints = {
                // Only ONE teacher can be assigned per class-section-subject
                @UniqueConstraint(columnNames = {"standard", "section", "subject"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer standard;

    @Column(length = 5)
    private String section;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Subject subject;

    @ManyToOne(optional = false)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
}
