package com.example.demo.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "issues")
@Data
public class Issue {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Creates the Foreign Key relationship
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String category;
    private String description;
    private String status = "OPEN";
    
    @Column(columnDefinition = "DECIMAL(10,8)")
    private double lat;
    
    @Column(columnDefinition = "DECIMAL(11,8)")
    private double lng;
    
    private String imageUrl;

    // How many citizens have reported this same issue (starts at 1,
    // incremented when a nearby duplicate report is merged into this one)
    private int reportCount = 1;
    
    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}