package com.school.portal.core.entity;

import com.school.portal.common.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;   // studentId / teacherId / adminId

    @Column(nullable = false)
    private String password;   // encrypted (BCrypt)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean active = true;

    // ✅ NEW: student can change password only once
    @Column(nullable = false)
    private boolean passwordChanged = false;
}