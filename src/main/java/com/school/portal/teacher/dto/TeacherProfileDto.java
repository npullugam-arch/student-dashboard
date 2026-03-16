package com.school.portal.teacher.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class TeacherProfileDto {

    private String teacherId;
    private String fullName;

    private String mobileNumber;
    private String emailId;
    private String address;
    private String profileUrl;

    private String subject;
    private String dateOfBirth;

    private Integer experience;     // ✅ MUST MATCH ENTITY TYPE
    private String aadhaarNumber;

    private String gender;
    private String religion;

    private Boolean active;
}
