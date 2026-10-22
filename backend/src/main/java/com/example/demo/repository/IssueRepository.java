package com.example.demo.repository;

import com.example.demo.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// The <Issue, Long> is mandatory! It tells Spring to manage the Issue table using a Long ID.
public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByUserId(Long userId);
    List<Issue> findByStatus(String status);

    // Candidates to check for a possible duplicate: same category, not yet resolved
    List<Issue> findByCategoryAndStatusNot(String category, String status);
}