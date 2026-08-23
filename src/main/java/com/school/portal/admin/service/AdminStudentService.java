package com.school.portal.admin.service;

import com.school.portal.admin.dto.CreateStudentRequest;
import com.school.portal.admin.repository.StudentRepository;
import com.school.portal.common.enums.Role;
import com.school.portal.core.entity.Student;
import com.school.portal.core.entity.User;
import com.school.portal.core.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminStudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public String addStudent(CreateStudentRequest request) {

        if (request.getStudentId() == null || request.getStudentId().isBlank()) {
            throw new RuntimeException("studentId is required");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new RuntimeException("fullName is required");
        }

        if (studentRepository.findByStudentId(request.getStudentId()).isPresent()) {
            throw new RuntimeException("StudentId already exists: " + request.getStudentId());
        }

        if (userRepository.findByUsername(request.getStudentId()).isPresent()) {
            throw new RuntimeException("Login username already exists: " + request.getStudentId());
        }

        boolean active = (request.getActive() == null) ? true : request.getActive();

        Student student = Student.builder()
                .studentId(request.getStudentId())
                .fullName(request.getFullName())
                .dateOfBirth(request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()
                        ? LocalDate.parse(request.getDateOfBirth())
                        : null)
                .phoneNumber(request.getPhoneNumber())
                .parentPhoneNumber(request.getParentPhoneNumber())
                .otherNumber(request.getOtherNumber())
                .address(request.getAddress())
                .standard(request.getStandard())
                .section(request.getSection())
                .academicYear(request.getAcademicYear())
                .fatherName(request.getFatherName())
                .motherName(request.getMotherName())
                .fatherOccupation(request.getFatherOccupation())
                .studentEmailId(request.getStudentEmailId())
                .parentEmailId(request.getParentEmailId())
                .profileUrl(request.getProfileUrl())
                .gender(request.getGender())
                .caste(request.getCaste())
                .religion(request.getReligion())
                .active(active)
                .build();

        studentRepository.save(student);

        String defaultPassword = "student123";

        User user = User.builder()
                .username(request.getStudentId())
                .password(passwordEncoder.encode(defaultPassword))
                .role(Role.STUDENT)
                .active(active)
                .build();

        userRepository.save(user);

        return "Student created successfully. Login username=" + request.getStudentId()
                + " password=" + defaultPassword;
    }

    // ✅ list all
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // ✅ get one by studentId
    public Student getStudent(String studentId) {
        return studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
    }

    // ✅ update by studentId
    public String updateStudent(String studentId, CreateStudentRequest request) {

        Student s = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        // studentId should NOT change
        s.setFullName(request.getFullName());
        s.setDateOfBirth(request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()
                ? LocalDate.parse(request.getDateOfBirth())
                : null);

        s.setPhoneNumber(request.getPhoneNumber());
        s.setParentPhoneNumber(request.getParentPhoneNumber());
        s.setOtherNumber(request.getOtherNumber());
        s.setAddress(request.getAddress());
        s.setStandard(request.getStandard());
        s.setSection(request.getSection());
        s.setAcademicYear(request.getAcademicYear());
        s.setFatherName(request.getFatherName());
        s.setMotherName(request.getMotherName());
        s.setFatherOccupation(request.getFatherOccupation());
        s.setStudentEmailId(request.getStudentEmailId());
        s.setParentEmailId(request.getParentEmailId());
        s.setProfileUrl(request.getProfileUrl());
        s.setGender(request.getGender());
        s.setCaste(request.getCaste());
        s.setReligion(request.getReligion());

        boolean active = request.getActive() == null ? s.isActive() : request.getActive();
        s.setActive(active);

        studentRepository.save(s);

        // keep login active in sync
        userRepository.findByUsername(studentId).ifPresent(u -> {
            u.setActive(active);
            userRepository.save(u);
        });

        return "Student updated successfully: " + studentId;
    }

    // ✅ delete by studentId (FIX: add @Transactional)
    @Transactional
    public String deleteStudent(String studentId) {

        if (!studentRepository.existsByStudentId(studentId)) {
            throw new RuntimeException("Student not found: " + studentId);
        }

        studentRepository.deleteByStudentId(studentId);
        userRepository.findByUsername(studentId).ifPresent(userRepository::delete);

        return "Student deleted successfully: " + studentId;
    }
}
