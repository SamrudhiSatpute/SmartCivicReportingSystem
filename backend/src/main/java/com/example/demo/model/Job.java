package com.example.demo.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "jobs")
@Data
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;    // e.g. "Road Repair", "Sanitation", "Electrical"
    private String location;

    private Double budget;

    private String status = "OPEN"; // OPEN, CLOSED

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
