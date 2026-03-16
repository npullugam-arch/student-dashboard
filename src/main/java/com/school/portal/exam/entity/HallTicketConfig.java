package com.school.portal.exam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hall_ticket_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallTicketConfig {

    @Id
    private Long id; // always 1L

    @Column(length = 500)
    private String logoUrl;

    @Column(length = 200)
    private String schoolName;

    @Column(length = 500)
    private String address;
}
