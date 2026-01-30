package com.school.portal.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Admin assigned unique student ID like S1001
    @Column(unique = true, nullable = false, length = 30)
    private String studentId;

    @Column(nullable = false, length = 120)
    private String fullName;

    private LocalDate dateOfBirth;

    // Student phone
    @Column(length = 20)
    private String phoneNumber;

    // Parent phone (main)
    @Column(length = 20)
    private String parentPhoneNumber;

    // Other / alternate phone
    @Column(length = 20)
    private String otherNumber;

    @Column(length = 255)
    private String address;

    // 7, 8, 9...
    private Integer standard;

    // A, B, C...
    @Column(length = 5)
    private String section;

    // 2025-2026
    @Column(length = 20)
    private String academicYear;

    // Parent details
    @Column(length = 120)
    private String fatherName;

    @Column(length = 120)
    private String motherName;

    @Column(length = 120)
    private String fatherOccupation;

    // Emails
    @Column(length = 120)
    private String studentEmailId;

    @Column(length = 120)
    private String parentEmailId;

    // Profile photo URL (stored as a link)
    @Column(length = 500)
    private String profileUrl;

    // Personal info
    @Column(length = 20)
    private String gender; // later we can convert to enum (MALE/FEMALE/OTHER)

    @Column(length = 60)
    private String caste;

    @Column(length = 60)
    private String religion;

    // Student status
    @Column(nullable = false)
    private boolean active = true;
}
