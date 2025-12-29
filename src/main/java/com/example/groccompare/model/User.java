package com.example.groccompare.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users") // This forces MongoDB to create a 'users' table
public class User {
    @Id
    private String id;
    private String username;
    private String password;

    // Standard Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}