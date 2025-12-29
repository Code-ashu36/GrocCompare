package com.example.groccompare.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// This tells MongoDB that this class represents a "collection" in the database
@Document(collection = "users")
public class User {
    @Id
    private String id; // MongoDB uses this as the unique key
    private String username;
    private String password; // We will store this as an encrypted hash

    // Standard Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}