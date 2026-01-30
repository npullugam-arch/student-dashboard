package com.school.portal.security;

import com.school.portal.security.user.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // ❌ Disable CSRF (REST APIs)
            .csrf(csrf -> csrf.disable())

            // ✅ Authentication provider
            .authenticationProvider(authenticationProvider())

            // ✅ Authorization rules
            .authorizeHttpRequests(auth -> auth

                // 🔓 Public endpoints
                .requestMatchers("/auth/**").permitAll()

                // 👨‍🎓 Student APIs
                .requestMatchers("/student/**").hasAnyRole("STUDENT", "ADMIN")

                // 👨‍🏫 Teacher APIs
                .requestMatchers("/teacher/**").hasAnyRole("TEACHER", "ADMIN")

                // 🧑‍💼 Admin APIs
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // 🏢 Office APIs
                .requestMatchers("/office/**").hasRole("OFFICE")

                // 🔒 Everything else must be authenticated
                .anyRequest().authenticated()
            )

            // ✅ Basic Auth (temporary, for backend testing)
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
