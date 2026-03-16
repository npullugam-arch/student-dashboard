package com.school.portal.teacher.service;

import com.school.portal.admin.repository.TeacherRepository;
import com.school.portal.core.entity.Teacher;
import com.school.portal.teacher.dto.TeacherProfileDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherProfileService {

    private final TeacherRepository teacherRepository;

    public TeacherProfileDto getTeacherProfile(String teacherId) {

        Teacher t = teacherRepository.findByTeacherId(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherId));

        return TeacherProfileDto.builder()
                .teacherId(t.getTeacherId())
                .fullName(t.getFullName())
                .mobileNumber(t.getMobileNumber())
                .emailId(t.getEmailId())
                .address(t.getAddress())
                .profileUrl(t.getProfileUrl())
                .subject(t.getSubject() != null ? t.getSubject().name() : null)
                .dateOfBirth(t.getDateOfBirth() != null ? t.getDateOfBirth().toString() : null)
                .experience(t.getExperience()) // ✅ works if DTO has Integer experience
                .aadhaarNumber(t.getAadhaarNumber())
                .gender(t.getGender())
                .religion(t.getReligion())
                .active(t.isActive())
                .build();
    }
}
