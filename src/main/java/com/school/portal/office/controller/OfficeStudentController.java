package com.school.portal.office.controller;

import com.school.portal.admin.repository.StudentRepository;
import com.school.portal.core.entity.Student;
import com.school.portal.office.dto.StudentProfileDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/office/api/students")
@RequiredArgsConstructor
public class OfficeStudentController {

    private final StudentRepository studentRepo;

    @GetMapping("/{studentId}")
    public StudentProfileDto byId(@PathVariable String studentId) {
        Student s = studentRepo.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        return StudentProfileDto.builder()
                .studentId(s.getStudentId())
                .fullName(s.getFullName())
                .dateOfBirth(s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : null)
                .phoneNumber(s.getPhoneNumber())
                .parentPhoneNumber(s.getParentPhoneNumber())
                .otherNumber(s.getOtherNumber())
                .address(s.getAddress())
                .standard(s.getStandard())
                .section(s.getSection())
                .academicYear(s.getAcademicYear())
                .fatherName(s.getFatherName())
                .motherName(s.getMotherName())
                .fatherOccupation(s.getFatherOccupation())
                .studentEmailId(s.getStudentEmailId())
                .parentEmailId(s.getParentEmailId())
                .profileUrl(s.getProfileUrl())
                .gender(s.getGender())
                .caste(s.getCaste())
                .religion(s.getReligion())
                .active(s.isActive())
                .build();
    }
}
