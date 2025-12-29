package com.example.groccompare.repository;

import com.example.groccompare.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

// This interface handles all the database work (Save, Delete, Find) for you
public interface UserRepository extends MongoRepository<User, String> {
    // This allows us to find a user by their username during login
    Optional<User> findByUsername(String username);
}