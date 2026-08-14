package com.school.portal.config;

import com.school.portal.common.enums.Role;
import com.school.portal.core.entity.User;
import com.school.portal.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initUsers(UserRepository userRepository) {
        return args -> {
            ensureBuiltInUser(userRepository, "admin", "admin123", Role.ADMIN);
            ensureBuiltInUser(userRepository, "office", "office123", Role.OFFICE);
        };
    }

    private void ensureBuiltInUser(UserRepository userRepository,
                                   String username,
                                   String rawPassword,
                                   Role role) {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> User.builder()
                        .username(username)
                        .password(passwordEncoder.encode(rawPassword))
                        .role(role)
                        .active(true)
                        .passwordChanged(false)
                        .build());

        boolean changed = false;
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            changed = true;
        }
        if (user.getRole() != role) {
            user.setRole(role);
            changed = true;
        }
        if (!user.isActive()) {
            user.setActive(true);
            changed = true;
        }

        if (user.getId() == null || changed) {
            userRepository.save(user);
        }
    }
}
