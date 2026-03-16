package com.school.portal.password.controller;

import com.school.portal.common.enums.Role;
import com.school.portal.password.dto.ResetPasswordRequest;
import com.school.portal.password.service.PasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/api/users")
@RequiredArgsConstructor
public class AdminPasswordController {

    private final PasswordService passwordService;

   
    @PostMapping("/students/{studentUsername}/reset-password")
    public ResponseEntity<?> resetStudentPassword(@PathVariable String studentUsername,
                                                 @RequestBody ResetPasswordRequest req) {
        passwordService.adminResetPassword(studentUsername, Role.STUDENT, req.getNewPassword());
        return ResponseEntity.ok().body("{\"message\":\"Student password reset successfully\"}");
    }

   
    @PostMapping("/teachers/{teacherUsername}/reset-password")
    public ResponseEntity<?> resetTeacherPassword(@PathVariable String teacherUsername,
                                                 @RequestBody ResetPasswordRequest req) {
        passwordService.adminResetPassword(teacherUsername, Role.TEACHER, req.getNewPassword());
        return ResponseEntity.ok().body("{\"message\":\"Teacher password reset successfully\"}");
    }
}