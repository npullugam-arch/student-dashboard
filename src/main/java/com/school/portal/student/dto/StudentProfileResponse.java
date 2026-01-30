package com.school.portal.student.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentProfileResponse {

    private String studentId;
    private String fullName;
    private String dateOfBirth;

    private String phoneNumber;
    private String parentPhoneNumber;

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

    
}
