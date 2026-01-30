package com.school.portal.student.service;

import com.school.portal.admin.repository.StudentRepository;
import com.school.portal.core.entity.Student;
import com.school.portal.student.dto.StudentProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentRepository studentRepository;

    public StudentProfileResponse getProfile(String studentId) {

        Student s = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        StudentProfileResponse res = new StudentProfileResponse();

        res.setStudentId(s.getStudentId());
        res.setFullName(s.getFullName());
        res.setDateOfBirth(
    s.getDateOfBirth() == null 
        ? null 
        : s.getDateOfBirth().toString()
);


        res.setPhoneNumber(s.getPhoneNumber());
        res.setParentPhoneNumber(s.getParentPhoneNumber());

        res.setStandard(s.getStandard());
        res.setSection(s.getSection());
        res.setAcademicYear(s.getAcademicYear());

        res.setFatherName(s.getFatherName());
        res.setMotherName(s.getMotherName());
        res.setFatherOccupation(s.getFatherOccupation());

        res.setStudentEmailId(s.getStudentEmailId());
        res.setParentEmailId(s.getParentEmailId());

        res.setProfileUrl(s.getProfileUrl());
        res.setGender(s.getGender());
        res.setCaste(s.getCaste());
        res.setReligion(s.getReligion());

        return res;
    }
}
