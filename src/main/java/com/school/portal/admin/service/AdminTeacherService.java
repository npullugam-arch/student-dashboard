package com.school.portal.admin.service;

import com.school.portal.admin.dto.AssignTeacherToCourseRequest;
import com.school.portal.admin.dto.ClassSectionRequest;
import com.school.portal.admin.dto.CreateTeacherRequest;
import com.school.portal.admin.repository.StandardSubjectRepository;
import com.school.portal.admin.repository.TeacherAssignmentRepository;
import com.school.portal.admin.repository.TeacherRepository;
import com.school.portal.common.enums.Role;
import com.school.portal.core.entity.StandardSubject;
import com.school.portal.core.entity.Teacher;
import com.school.portal.core.entity.TeacherAssignment;
import com.school.portal.core.entity.User;
import com.school.portal.core.repository.UserRepository;
import lombok.AllArgsConstructor;
import com.school.portal.admin.dto.TeacherSummaryDto;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminTeacherService {

    private final TeacherRepository teacherRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StandardSubjectRepository standardSubjectRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ============================
    // ✅ DTOs (kept inside service to avoid creating extra files)
    // ============================

    @Data
    public static class UpdateTeacherRequest {
        private String fullName;
        private String mobileNumber;
        private String emailId;
        private String address;
        private String profileUrl;
        private String dateOfBirth; // yyyy-MM-dd
        private Integer experience;
        private String aadhaarNumber;
        private String gender;
        private String religion;
        private Boolean active;
    }

    @Data
    @Builder
    public static class TeacherRow {
        private String teacherId;
        private String fullName;
        private String mainSubject; // derived from assignments
        private String mobileNumber;
        private String emailId;
        private boolean active;
    }

    @Data
    @Builder
    public static class TeacherDetails {
        private String teacherId;
        private String fullName;
        private String mobileNumber;
        private String emailId;
        private String address;
        private String profileUrl;
        private String dateOfBirth;
        private Integer experience;
        private String aadhaarNumber;
        private String gender;
        private String religion;
        private boolean active;
        private List<TeacherAssignmentRow> assignments;
    }

    @Data
    @Builder
    public static class TeacherAssignmentRow {
        private Long assignmentId;
        private Integer standard;
        private String section;
        private Long standardSubjectId;
        private String subjectName; // from SubjectEntity
        private boolean active;
    }

    // ============================
    // ✅ CREATE TEACHER + assignments
    // ============================
    public String addTeacher(CreateTeacherRequest request) {

        if (request.getTeacherId() == null || request.getTeacherId().isBlank()) {
            throw new RuntimeException("teacherId is required");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new RuntimeException("fullName is required");
        }
        if (request.getStandards() == null || request.getStandards().isEmpty()) {
            throw new RuntimeException("standards list is required (at least one assignment)");
        }

        if (teacherRepository.findByTeacherId(request.getTeacherId()).isPresent()) {
            throw new RuntimeException("TeacherId already exists: " + request.getTeacherId());
        }
        if (userRepository.findByUsername(request.getTeacherId()).isPresent()) {
            throw new RuntimeException("Login username already exists: " + request.getTeacherId());
        }

        boolean active = request.getActive() == null ? true : request.getActive();

        Teacher teacher = Teacher.builder()
                .teacherId(request.getTeacherId())
                .fullName(request.getFullName())
                .mobileNumber(request.getMobileNumber())
                .emailId(request.getEmailId())
                .address(request.getAddress())
                .profileUrl(request.getProfileUrl())
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

        // ✅ Save multiple assignments (DB driven)
        for (ClassSectionRequest cs : request.getStandards()) {

            if (cs.getStandard() == null) {
                throw new RuntimeException("Each standards item must have standard");
            }
            if (cs.getSection() == null || cs.getSection().isBlank()) {
                throw new RuntimeException("Each standards item must have section");
            }
            if (cs.getStandardSubjectId() == null) {
                throw new RuntimeException("Each standards item must have standardSubjectId");
            }

            StandardSubject standardSubject = standardSubjectRepository.findById(cs.getStandardSubjectId())
                    .orElseThrow(() -> new RuntimeException("StandardSubject not found: " + cs.getStandardSubjectId()));

            if (!cs.getStandard().equals(standardSubject.getStandard())) {
                throw new RuntimeException(
                        "Standard mismatch: request standard=" + cs.getStandard()
                                + " but standardSubject.standard=" + standardSubject.getStandard()
                );
            }

            TeacherAssignment assignment = TeacherAssignment.builder()
                    .teacher(teacher)
                    .standardSubject(standardSubject)
                    .section(cs.getSection())
                    .active(true)
                    .build();

            teacherAssignmentRepository.save(assignment);
        }

        // ✅ Create teacher login
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

    // ============================
    // ✅ LIST TEACHERS (FIXES 405)
    // ============================
    public List<TeacherRow> listTeachers() {
        List<Teacher> teachers = teacherRepository.findAll();

        return teachers.stream()
                .map(t -> {
                    // derive main subject from first active assignment
                    String mainSubject = teacherAssignmentRepository
                            .findByTeacher_TeacherIdAndActiveTrue(t.getTeacherId())
                            .stream()
                            .sorted(Comparator.comparing(a -> a.getId()))
                            .map(a -> a.getStandardSubject().getSubject() != null ? a.getStandardSubject().getSubject().getName() : "UNKNOWN")
                            .findFirst()
                            .orElse("—");

                    return TeacherRow.builder()
                            .teacherId(t.getTeacherId())
                            .fullName(t.getFullName())
                            .mainSubject(mainSubject)
                            .mobileNumber(t.getMobileNumber())
                            .emailId(t.getEmailId())
                            .active(t.isActive())
                            .build();
                })
                .toList();
    }

    // ============================
    // ✅ GET TEACHER DETAILS (for edit modal)
    // ============================
    public TeacherDetails getTeacherDetails(String teacherId) {
        Teacher teacher = teacherRepository.findByTeacherId(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherId));

        List<TeacherAssignmentRow> assignments = getTeacherAssignments(teacherId);

        return TeacherDetails.builder()
                .teacherId(teacher.getTeacherId())
                .fullName(teacher.getFullName())
                .mobileNumber(teacher.getMobileNumber())
                .emailId(teacher.getEmailId())
                .address(teacher.getAddress())
                .profileUrl(teacher.getProfileUrl())
                .dateOfBirth(teacher.getDateOfBirth() != null ? teacher.getDateOfBirth().toString() : null)
                .experience(teacher.getExperience())
                .aadhaarNumber(teacher.getAadhaarNumber())
                .gender(teacher.getGender())
                .religion(teacher.getReligion())
                .active(teacher.isActive())
                .assignments(assignments)
                .build();
    }

    // ============================
    // ✅ UPDATE TEACHER BASIC INFO
    // ============================
    public String updateTeacher(String teacherId, UpdateTeacherRequest req) {
        Teacher teacher = teacherRepository.findByTeacherId(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherId));

        if (req.getFullName() != null) teacher.setFullName(req.getFullName());
        if (req.getMobileNumber() != null) teacher.setMobileNumber(req.getMobileNumber());
        if (req.getEmailId() != null) teacher.setEmailId(req.getEmailId());
        if (req.getAddress() != null) teacher.setAddress(req.getAddress());
        if (req.getProfileUrl() != null) teacher.setProfileUrl(req.getProfileUrl());

        if (req.getDateOfBirth() != null && !req.getDateOfBirth().isBlank()) {
            teacher.setDateOfBirth(LocalDate.parse(req.getDateOfBirth()));
        }

        if (req.getExperience() != null) teacher.setExperience(req.getExperience());
        if (req.getAadhaarNumber() != null) teacher.setAadhaarNumber(req.getAadhaarNumber());
        if (req.getGender() != null) teacher.setGender(req.getGender());
        if (req.getReligion() != null) teacher.setReligion(req.getReligion());

        if (req.getActive() != null) {
            teacher.setActive(req.getActive());
            // also sync login active
            userRepository.findByUsername(teacherId).ifPresent(u -> {
                u.setActive(req.getActive());
                userRepository.save(u);
            });
        }

        teacherRepository.save(teacher);
        return "Teacher updated successfully: " + teacherId;
    }

    // ============================
    // ✅ SOFT DELETE TEACHER
    // ============================
    public String deactivateTeacher(String teacherId) {
        Teacher teacher = teacherRepository.findByTeacherId(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherId));

        teacher.setActive(false);
        teacherRepository.save(teacher);

        // deactivate assignments
        List<TeacherAssignment> all = teacherAssignmentRepository.findByTeacher_TeacherId(teacherId);
        for (TeacherAssignment a : all) {
            a.setActive(false);
        }
        teacherAssignmentRepository.saveAll(all);

        // deactivate login
        userRepository.findByUsername(teacherId).ifPresent(u -> {
            u.setActive(false);
            userRepository.save(u);
        });

        return "Teacher deactivated successfully: " + teacherId;
    }

    // ============================
    // ✅ GET ASSIGNMENTS OF TEACHER
    // ============================
    public List<TeacherAssignmentRow> getTeacherAssignments(String teacherId) {
        return teacherAssignmentRepository.findByTeacher_TeacherIdAndActiveTrue(teacherId)
                .stream()
                .map(a -> TeacherAssignmentRow.builder()
                        .assignmentId(a.getId())
                        .standard(a.getStandardSubject().getStandard())
                        .section(a.getSection())
                        .standardSubjectId(a.getStandardSubject().getId())
                        .subjectName(a.getStandardSubject().getSubject() != null ? a.getStandardSubject().getSubject().getName() : "UNKNOWN")
                        .active(Boolean.TRUE.equals(a.getActive()))
                        .build())
                .toList();
    }

    // ============================
    // ✅ SOFT DELETE ONE ASSIGNMENT
    // ============================
    public String deactivateAssignment(String teacherId, Long assignmentId) {

        TeacherAssignment assignment = teacherAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        if (!assignment.getTeacher().getTeacherId().equals(teacherId)) {
            throw new RuntimeException("Assignment does not belong to teacher: " + teacherId);
        }

        assignment.setActive(false);
        teacherAssignmentRepository.save(assignment);

        return "Assignment deactivated: " + assignmentId;
    }

    // ============================
    // ✅ ASSIGN TEACHER TO COURSE
    // ============================
    public String assignTeacherToCourse(AssignTeacherToCourseRequest request) {

        if (request.getStandardSubjectId() == null) {
            throw new RuntimeException("standardSubjectId is required");
        }
        if (request.getSection() == null || request.getSection().isBlank()) {
            throw new RuntimeException("section is required");
        }
        if (request.getTeacherId() == null || request.getTeacherId().isBlank()) {
            throw new RuntimeException("teacherId is required");
        }

        Teacher teacher = teacherRepository.findByTeacherId(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + request.getTeacherId()));

        StandardSubject standardSubject = standardSubjectRepository.findById(request.getStandardSubjectId())
                .orElseThrow(() -> new RuntimeException("StandardSubject not found: " + request.getStandardSubjectId()));

        TeacherAssignment assignment = teacherAssignmentRepository
                .findByStandardSubject_IdAndSection(request.getStandardSubjectId(), request.getSection())
                .orElse(null);

        if (assignment == null) {
            assignment = TeacherAssignment.builder()
                    .teacher(teacher)
                    .standardSubject(standardSubject)
                    .section(request.getSection())
                    .active(true)
                    .build();
        } else {
            assignment.setTeacher(teacher);
            assignment.setActive(true);
        }

        teacherAssignmentRepository.save(assignment);

        String subjectName = standardSubject.getSubject() != null
                ? standardSubject.getSubject().getName()
                : "UNKNOWN_SUBJECT";

        return "Assigned teacher " + teacher.getTeacherId() + " to "
                + standardSubject.getStandard() + "-" + request.getSection()
                + " (" + subjectName + ")";
    }

    public List<TeacherSummaryDto> listTeachers(String q) {

        List<Teacher> teachers;

        if (q == null || q.isBlank()) {
            teachers = teacherRepository.findAll();
        } else {
            String s = q.trim().toLowerCase();
            teachers = teacherRepository.searchByIdOrName(s);
        }

        return teachers.stream()
                .map(t -> new TeacherSummaryDto(
                        t.getTeacherId(),
                        t.getFullName(),
                        t.getMobileNumber(),
                        t.getEmailId(),
                        t.isActive()
                ))
                .toList();
    }
}