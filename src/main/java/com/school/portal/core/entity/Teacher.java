package com.school.portal.core.entity;

import com.school.portal.common.enums.Subject;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Admin assigned unique teacher ID like T1001
    @Column(unique = true, nullable = false, length = 30)
    private String teacherId;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(length = 20)
    private String mobileNumber;

    @Column(length = 120)
    private String emailId;

    @Column(length = 255)
    private String address;

    @Column(length = 500)
    private String profileUrl;

    /*
     * ✅ IMPORTANT:
     * Teacher can teach MULTIPLE subjects now.
     * Subjects are stored in TeacherAssignment -> StandardSubject mapping.
     *
     * So "subject" here is OPTIONAL (only if you want to show a "main subject").
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = true, length = 30)
    private Subject subject; // optional

    private LocalDate dateOfBirth;

    // years of experience
    private Integer experience;

    // Aadhaar is 12 digits, keep as String
    @Column(length = 12)
    private String aadhaarNumber;

    @Column(length = 20)
    private String gender;

    @Column(length = 60)
    private String religion;

    @Column(nullable = false)
    private boolean active = true;
}