package com.school.portal.password.controller;

import com.school.portal.password.dto.ChangePasswordRequest;
import com.school.portal.password.dto.PasswordStatusResponse;
import com.school.portal.password.service.PasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student/api/password")
@RequiredArgsConstructor
public class StudentPasswordController {

    private final PasswordService passwordService;

    // ✅ frontend uses this to show/hide button
    @GetMapping("/status")
    public ResponseEntity<PasswordStatusResponse> status(Authentication auth) {
        String username = auth.getName();
        boolean canChange = passwordService.canStudentChangePassword(username);
        return ResponseEntity.ok(new PasswordStatusResponse(canChange));
    }

    // ✅ student change password ONLY ONCE
    @PostMapping("/change-once")
    public ResponseEntity<?> changeOnce(@RequestBody ChangePasswordRequest req,
                                        Authentication auth) {
        String username = auth.getName();
        passwordService.studentChangePasswordOnce(username, req.getNewPassword(), req.getConfirmPassword());
        return ResponseEntity.ok().body("{\"message\":\"Password updated successfully\"}");
    }
}