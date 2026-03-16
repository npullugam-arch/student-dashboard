package com.school.portal.office.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfileDto {
    private String studentId;
    private String fullName;
    private String dateOfBirth; // yyyy-MM-dd or null

    private String phoneNumber;
    private String parentPhoneNumber;
    private String otherNumber;

    private String address;

    private Integer standard;
    private String section;
    private String academicYear;

    private String fatherName;
    private String motherName;
    private String fatherOccupation;

    private String studentEmailId;
    private String parentEmailId;

    private String profileUrl;
    private String gender;
    private String caste;
    private String religion;

    private boolean active;
}
