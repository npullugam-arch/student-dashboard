package com.school.portal.admin.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateTeacherRequest {

    private String teacherId;
    private String fullName;
    private String mobileNumber;
    private String emailId;
    private String address;
    private String profileUrl;

    // private String subject; // "MATHS" etc

    private String dateOfBirth; // "YYYY-MM-DD"
    private Integer experience;
    private String aadhaarNumber;
    private String gender;
    private String religion;

    private Boolean active;

    // Multiple class+section entries
    private List<ClassSectionRequest> standards;
}
