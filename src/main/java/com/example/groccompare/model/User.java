package com.example.groccompare.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users") // Plural collection name
public class User {
    @Id
    private String id;
    private String username;
    private String password;

    // IMPORTANT: You must have these for the form to work
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}