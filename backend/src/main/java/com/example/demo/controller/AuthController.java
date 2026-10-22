package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Updated this line to match Vite!
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Prevent duplicate emails
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginDetails) {
        Optional<User> userOptional = userRepository.findByEmail(loginDetails.getEmail());
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Validate password
            if (user.getPassword().equals(loginDetails.getPassword())) {
                return ResponseEntity.ok(user);
            }
        }
        
        return ResponseEntity.status(401).body("Invalid email or password");
    }
}