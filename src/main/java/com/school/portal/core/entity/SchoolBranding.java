package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "school_branding")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolBranding {

    @Id
    private Long id; // we will keep a single row: id = 1

    @Column(name = "school_name", nullable = false, length = 200)
    private String schoolName;

    @Column(name = "logo_url", length = 1000)
    private String logoUrl;

    @Column(name = "updated_by", length = 60)
    private String updatedBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}