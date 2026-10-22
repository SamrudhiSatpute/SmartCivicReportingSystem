package com.example.demo.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

// One row per (issue, citizen) pair. The first row for an issue is its
// original reporter; every later row is a citizen who reported the same
// physical problem again (possibly from a different angle/photo). This is
// what lets us merge duplicates into a single Issue while still keeping
// track of who reported it and giving each of them credit.
@Entity
@Table(name = "issue_reporters", uniqueConstraints = @UniqueConstraint(columnNames = { "issue_id", "user_id" }))
@Data
public class IssueReporter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // This particular citizen's own photo/angle of the problem
    private String imageUrl;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
