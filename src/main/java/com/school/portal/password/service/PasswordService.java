package com.school.portal.password.service;

import com.school.portal.common.enums.Role;
import com.school.portal.core.entity.User;
import com.school.portal.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private User getActiveUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isActive()) throw new RuntimeException("User is inactive");
        return user;
    }

    // =========================
    // ✅ STUDENT: one-time change
    // =========================
    public boolean canStudentChangePassword(String username) {
        User user = getActiveUser(username);
        if (user.getRole() != Role.STUDENT) return false;
        return !user.isPasswordChanged();
    }

    public void studentChangePasswordOnce(String username, String newPassword, String confirmPassword) {
        User user = getActiveUser(username);

        if (user.getRole() != Role.STUDENT)
            throw new RuntimeException("Only STUDENT can change password here");

        changePasswordOnce(user, newPassword, confirmPassword);
    }

    // =========================
    // ✅ TEACHER: one-time change
    // =========================
    public boolean canTeacherChangePassword(String username) {
        User user = getActiveUser(username);
        if (user.getRole() != Role.TEACHER) return false;
        return !user.isPasswordChanged();
    }

    public void teacherChangePasswordOnce(String username, String newPassword, String confirmPassword) {
        User user = getActiveUser(username);

        if (user.getRole() != Role.TEACHER)
            throw new RuntimeException("Only TEACHER can change password here");

        changePasswordOnce(user, newPassword, confirmPassword);
    }

    // =========================
    // ✅ Admin resets (Student/Teacher)
    // =========================
    public void adminResetPassword(String targetUsername, Role expectedRole, String newPassword) {
        User user = getActiveUser(targetUsername);

        if (expectedRole != null && user.getRole() != expectedRole) {
            throw new RuntimeException("User role mismatch");
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Password cannot be empty");
        }
        if (newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        // ✅ As per your rule: one-time only. After reset also lock it.
        user.setPasswordChanged(true);

        userRepository.save(user);
    }

    // =========================
    // Internal helper
    // =========================
    private void changePasswordOnce(User user, String newPassword, String confirmPassword) {
        if (user.isPasswordChanged()) {
            throw new RuntimeException("Password already changed once. Contact Admin.");
        }

        if (newPassword == null || confirmPassword == null || newPassword.isBlank() || confirmPassword.isBlank()) {
            throw new RuntimeException("Password cannot be empty");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("Passwords do not match");
        }

        if (newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChanged(true); // ✅ lock forever after first change
        userRepository.save(user);
    }
}