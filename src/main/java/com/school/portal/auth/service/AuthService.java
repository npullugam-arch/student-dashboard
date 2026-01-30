package com.school.portal.auth.service;

import com.school.portal.auth.dto.LoginRequest;
import com.school.portal.auth.dto.LoginResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;

    public AuthService(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    public LoginResponse login(LoginRequest req, HttpServletRequest httpReq) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        // store auth in security context (session-based login)
        SecurityContextHolder.getContext().setAuthentication(auth);
        httpReq.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext()
        );

        String role = auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())        // ex: "ROLE_ADMIN"
                .orElse("ROLE_UNKNOWN");

        role = role.replace("ROLE_", "");        // -> "ADMIN"

        return new LoginResponse(true, "Login successful", auth.getName(), role);
    }
}
