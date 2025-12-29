package com.example.groccompare.controller;

import com.example.groccompare.model.User;
import com.example.groccompare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    // Use @ModelAttribute to map form fields to the User object
    @PostMapping("/register")
public String registerUser(@ModelAttribute User user) {
    try {
        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        System.out.println("Successfully saved user: " + user.getUsername());
        return "redirect:/login?success";
    } catch (Exception e) {
        e.printStackTrace(); // This will show the exact error in Railway Logs
        return "redirect:/register?error";
    }
}
}