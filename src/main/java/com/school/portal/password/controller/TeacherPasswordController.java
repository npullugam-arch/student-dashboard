package com.school.portal.password.controller;

import com.school.portal.password.dto.ChangePasswordRequest;
import com.school.portal.password.dto.PasswordStatusResponse;
import com.school.portal.password.service.PasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/teacher/api/password")
@RequiredArgsConstructor
public class TeacherPasswordController {

    private final PasswordService passwordService;

    // ✅ frontend uses this to show/hide change password button
    @GetMapping("/status")
    public ResponseEntity<PasswordStatusResponse> status(Authentication auth) {
        String username = auth.getName();
        boolean canChange = passwordService.canTeacherChangePassword(username);
        return ResponseEntity.ok(new PasswordStatusResponse(canChange));
    }

    // ✅ teacher change password ONLY ONCE
    @PostMapping("/change-once")
    public ResponseEntity<?> changeOnce(@RequestBody ChangePasswordRequest req,
                                        Authentication auth) {
        String username = auth.getName();
        passwordService.teacherChangePasswordOnce(username, req.getNewPassword(), req.getConfirmPassword());
        return ResponseEntity.ok().body("{\"message\":\"Password updated successfully\"}");
    }
}