package com.example.groccompare.controller;

import com.example.groccompare.model.User;
import com.example.groccompare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Show Login Page
    @GetMapping("/login")
    public String login() {
        return "login"; 
    }

    // Show Registration Page
    @GetMapping("/register")
    public String register() {
        return "register";
    }

    // Handle Registration Form Submission
    @PostMapping("/register")
    public String registerUser(User user) {
        // Encrypt the password before saving to MongoDB
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "redirect:/login?success"; // Redirect to login after successful signup
    }
}