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

            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .active(true)
                        .build();

                userRepository.save(admin);
            }

            if (userRepository.findByUsername("office").isEmpty()) {
                User office = User.builder()
                        .username("office")
                        .password(passwordEncoder.encode("office123"))
                        .role(Role.OFFICE)
                        .active(true)
                        .build();

                userRepository.save(office);
            }
        };
    }
}
