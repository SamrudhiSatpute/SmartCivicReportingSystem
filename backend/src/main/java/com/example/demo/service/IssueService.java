package com.example.demo.service;

import com.example.demo.model.Issue;
import com.example.demo.model.User;
import com.example.demo.repository.IssueRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    public Issue createIssue(Long userId, Issue issue) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        issue.setUser(userOptional.get());
        return (Issue) issueRepository.save(issue);
    }

    public List<Issue> getIssuesByUser(Long userId) {
        return issueRepository.findByUserId(userId);
    }

    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }

    public Issue updateIssueStatus(Long issueId, String status) {
        Optional<Issue> issueOptional = issueRepository.findById(issueId);
        if (issueOptional.isEmpty()) {
            throw new RuntimeException("Issue not found");
        }

        Issue issue = issueOptional.get();
        issue.setStatus(status);

        // Citizen Reward System Logic lives here now
        if ("RESOLVED".equalsIgnoreCase(status)) {
            User citizen = issue.getUser();
            citizen.setRewardPoints(citizen.getRewardPoints() + 10);
            userRepository.save(citizen);
        }

        return (Issue) issueRepository.save(issue);
    }
}