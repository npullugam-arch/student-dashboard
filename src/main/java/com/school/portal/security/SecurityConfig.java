package com.school.portal.security;

import com.school.portal.security.user.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .authenticationProvider(authenticationProvider())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ✅ allow preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ---------- PUBLIC STATIC ----------
                        .requestMatchers(
                                "/", "/index.html",
                                "/favicon.ico",
                                "/error",

                                "/shared/**",
                                "/login/**",

                                "/student/**",      // student static pages
                                "/office/**",       // ✅ allow office HTML/JS/CSS
                                "/teacher/**",      // teacher static
                                "/admin/**",        // admin static

                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/assets/**",

                                "/uploads/**",      // ✅ uploads public

                                "/ws/**"
                        ).permitAll()

                        // ---------- AUTH ----------
                        .requestMatchers("/auth/**").permitAll()

                        // ✅✅ NEW: Secure password APIs for students
                        // Must be placed BEFORE "/student/api/** permitAll"
                        .requestMatchers("/student/api/password/**").hasRole("STUDENT")

                        // ---------- STUDENT APIs ----------
                        .requestMatchers("/student/api/**").permitAll()

                        // ✅ Notices/Holidays view
                        .requestMatchers("/notices/**", "/holidays/**")
                        .hasAnyRole("STUDENT", "TEACHER", "ADMIN", "OFFICE")

                        // ---------- OFFICE APIs ----------
                        .requestMatchers("/office/api/**").hasRole("OFFICE")

                        // ---------- TEACHER APIs ----------
                        .requestMatchers("/teacher/api/**").hasAnyRole("TEACHER", "ADMIN")

                        // ✅ Admin Notice/Holiday management APIs
                        .requestMatchers("/admin/api/notices/**", "/admin/api/holidays/**").hasRole("ADMIN")

                        // ---------- ADMIN APIs ----------
                        .requestMatchers("/admin/api/**").hasRole("ADMIN")

                        // ✅ Branding
                        .requestMatchers("/api/branding").authenticated()
                        .requestMatchers("/api/admin/branding").hasRole("ADMIN")

                        // ---------- TIMETABLE ----------
                        .requestMatchers("/student/api/timetable/**").permitAll()
                        .requestMatchers("/admin/api/timetable/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .httpBasic(basic -> basic.authenticationEntryPoint((request, response, exception) ->
                        response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized")
                ));

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
