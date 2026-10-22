package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Optional but good practice

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // This finds a user by their email address
    java.util.Optional<User> findByEmail(String email);
}