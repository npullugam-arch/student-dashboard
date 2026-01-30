package com.school.portal.admin.service;

import com.school.portal.admin.dto.ClassSectionRequest;
import com.school.portal.admin.dto.CreateTeacherRequest;
import com.school.portal.admin.repository.TeacherAssignmentRepository;
import com.school.portal.admin.repository.TeacherRepository;
import com.school.portal.common.enums.Role;
import com.school.portal.common.enums.Subject;
import com.school.portal.core.entity.Teacher;
import com.school.portal.core.entity.TeacherAssignment;
import com.school.portal.core.entity.User;
import com.school.portal.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AdminTeacherService {

    private final TeacherRepository teacherRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public String addTeacher(CreateTeacherRequest request) {

        if (request.getTeacherId() == null || request.getTeacherId().isBlank()) {
            throw new RuntimeException("teacherId is required");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new RuntimeException("fullName is required");
        }
        if (request.getSubject() == null || request.getSubject().isBlank()) {
            throw new RuntimeException("subject is required");
        }
        if (request.getStandards() == null || request.getStandards().isEmpty()) {
            throw new RuntimeException("standards list is required (at least one standard+section)");
        }

        if (teacherRepository.findByTeacherId(request.getTeacherId()).isPresent()) {
            throw new RuntimeException("TeacherId already exists: " + request.getTeacherId());
        }

        if (userRepository.findByUsername(request.getTeacherId()).isPresent()) {
            throw new RuntimeException("Login username already exists: " + request.getTeacherId());
        }

        boolean active = request.getActive() == null ? true : request.getActive();
        Subject subject = Subject.valueOf(request.getSubject().toUpperCase());

        Teacher teacher = Teacher.builder()
                .teacherId(request.getTeacherId())
                .fullName(request.getFullName())
                .mobileNumber(request.getMobileNumber())
                .emailId(request.getEmailId())
                .address(request.getAddress())
                .profileUrl(request.getProfileUrl())
                .subject(subject)
                .dateOfBirth(request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()
                        ? LocalDate.parse(request.getDateOfBirth())
                        : null)
                .experience(request.getExperience())
                .aadhaarNumber(request.getAadhaarNumber())
                .gender(request.getGender())
                .religion(request.getReligion())
                .active(active)
                .build();

        teacherRepository.save(teacher);

        // Save multiple assignments
        for (ClassSectionRequest cs : request.getStandards()) {
            if (cs.getStandard() == null || cs.getSection() == null || cs.getSection().isBlank()) {
                throw new RuntimeException("Each standards item must have standard and section");
            }

            TeacherAssignment assignment = TeacherAssignment.builder()
                    .standard(cs.getStandard())
                    .section(cs.getSection())
                    .subject(subject)
                    .teacher(teacher)
                    .build();

            teacherAssignmentRepository.save(assignment);
        }

        // Create teacher login
        String defaultPassword = "teacher123";

        User user = User.builder()
                .username(request.getTeacherId())
                .password(passwordEncoder.encode(defaultPassword))
                .role(Role.TEACHER)
                .active(active)
                .build();

        userRepository.save(user);

        return "Teacher created successfully. Login username=" + request.getTeacherId()
                + " password=" + defaultPassword;
    }
}
