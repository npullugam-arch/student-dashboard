package com.school.portal.auth.controller;

import com.school.portal.auth.dto.LoginRequest;
import com.school.portal.auth.dto.LoginResponse;
import com.school.portal.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req,
                                               HttpServletRequest httpReq) {
        LoginResponse res = authService.login(req, httpReq);
        return ResponseEntity.ok(res);
    }
}