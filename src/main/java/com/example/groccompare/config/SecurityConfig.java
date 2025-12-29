package com.example.groccompare.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // This tool encrypts passwords so even if the DB is leaked, passwords are safe
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disabled for local development simplicity
                .authorizeHttpRequests(auth -> auth
                        // Allow everyone to see the splash screen, login page, and static files
                        .requestMatchers("/", "/login", "/register", "/css/**", "/js/**", "/images/**").permitAll()
                        // Everything else (like search) requires logging in
                        .anyRequest().authenticated())
                .formLogin(form -> form
                        .loginPage("/login") // Use our custom login page
                        .defaultSuccessUrl("/", true) // Go to home/search after success
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login?logout") // Redirect to login with a message
                        .permitAll());

        return http.build();
    }
}