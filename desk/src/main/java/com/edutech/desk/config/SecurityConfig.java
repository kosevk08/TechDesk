package com.edutech.desk.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "https://techdesk-frontend.onrender.com"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/user/login", "/api/user/register", "/api/user/health", "/api/demo/**").permitAll()
                .requestMatchers("/api/feedback/all").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/feedback").authenticated()
                .requestMatchers("/api/user/all").hasRole("ADMIN")
                .requestMatchers("/api/teacher/all", "/api/teacher/subjects").hasRole("ADMIN")
                .requestMatchers("/api/tests/teacher/**", "/api/tests/classes", "/api/tests/submissions/**", "/api/tests/submission/*/grade").hasRole("TEACHER")
                .requestMatchers("/api/attendance/mark", "/api/attendance/date/**").hasRole("TEACHER")
                .requestMatchers("/api/grades").hasRole("TEACHER")
                .requestMatchers("/api/notebook/teacher").hasRole("TEACHER")
                .requestMatchers("/api/grades/**", "/api/attendance/student/**", "/api/notifications/**").authenticated()
                .requestMatchers("/api/tests/student/**", "/api/tests/*/submit").hasRole("STUDENT")
                .requestMatchers("/api/tests/results/**", "/api/message/**", "/api/notebook/**", "/api/subject/**", "/api/student/**", "/api/parent/**", "/api/ai/**").authenticated()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(demoAccessFilter, JwtAuthenticationFilter.class);
        return http.build();
    }
}