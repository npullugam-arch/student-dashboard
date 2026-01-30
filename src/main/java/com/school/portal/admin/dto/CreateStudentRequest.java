package com.school.portal.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateStudentRequest {

    private String studentId;
    private String fullName;
    private String dateOfBirth; // "YYYY-MM-DD"

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

    // status
    private Boolean active; // optional (if null -> true)
}
