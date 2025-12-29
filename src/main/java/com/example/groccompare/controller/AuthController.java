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
    // 1. Log the incoming data to see if it's empty
    System.out.println("DEBUG: Received registration request for: " + user.getUsername());

    try {
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            System.out.println("DEBUG: Error - Password was empty!");
            return "redirect:/register?error=empty_password";
        }

        // 2. Encrypt and Save
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        
        System.out.println("DEBUG: Successfully saved user to MongoDB!");
        return "redirect:/login?success";
    } catch (Exception e) {
        // 3. This will print the exact connection error in Railway Logs
        System.err.println("DEBUG: Database Error: " + e.getMessage());
        e.printStackTrace(); 
        return "redirect:/register?error=database_connection";
    }
}
}