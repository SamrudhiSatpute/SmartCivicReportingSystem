package com.example.demo.controller;

import com.example.demo.model.Issue;
import com.example.demo.model.IssueReporter;
import com.example.demo.model.User;
import com.example.demo.repository.IssueReporterRepository;
import com.example.demo.repository.IssueRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.GeoUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "http://localhost:5173") // Updated to match Vite's port!
public class IssueController {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IssueReporterRepository issueReporterRepository;

    // Two reports of the same category within this many meters of each other
    // are treated as the same physical problem
    @Value("${app.duplicate.radius-meters:50}")
    private double duplicateRadiusMeters;

    // Points given to the original reporter when their issue is RESOLVED
    @Value("${app.reward.original-points:10}")
    private int originalReportPoints;

    // Smaller points given to every citizen whose report got merged into
    // an already-existing issue, once that issue is RESOLVED
    @Value("${app.reward.duplicate-points:4}")
    private int duplicateReportPoints;

    // 1. Citizen creates a new report — automatically merged into a nearby
    //    existing report of the same category if one is found within range
    @PostMapping("/report/{userId}")
    public ResponseEntity<?> reportIssue(@PathVariable Long userId, @RequestBody Issue issue) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User reporter = userOptional.get();

        Issue duplicateMatch = findNearbyDuplicate(issue);

        if (duplicateMatch != null) {
            // Same citizen can't inflate the count by reporting the same spot twice
            if (issueReporterRepository.existsByIssueIdAndUserId(duplicateMatch.getId(), reporter.getId())) {
                return ResponseEntity.badRequest()
                        .body("You've already reported this issue. It's already logged and being tracked.");
            }

            duplicateMatch.setReportCount(duplicateMatch.getReportCount() + 1);
            issueRepository.save(duplicateMatch);

            saveReporter(duplicateMatch, reporter, issue.getImageUrl());

            return ResponseEntity.ok(Map.of(
                    "issue", duplicateMatch,
                    "duplicate", true,
                    "message", "This looks like an existing issue nearby (" + duplicateMatch.getReportCount()
                            + " citizens have now reported it). Your report and photo were added to it."
            ));
        }

        // No nearby match — this is a genuinely new issue
        issue.setUser(reporter);
        issue.setReportCount(1);
        Issue savedIssue = issueRepository.save(issue);

        saveReporter(savedIssue, reporter, savedIssue.getImageUrl());

        return ResponseEntity.ok(Map.of(
                "issue", savedIssue,
                "duplicate", false,
                "message", "Issue reported successfully!"
        ));
    }

    // Looks for an existing, unresolved issue of the same category within
    // duplicateRadiusMeters of the new report. Returns the closest match, or
    // null if nothing nearby was found.
    private Issue findNearbyDuplicate(Issue newIssue) {
        List<Issue> candidates = issueRepository.findByCategoryAndStatusNot(newIssue.getCategory(), "RESOLVED");

        Issue closestMatch = null;
        double closestDistance = Double.MAX_VALUE;

        for (Issue existing : candidates) {
            double distance = GeoUtils.distanceInMeters(
                    newIssue.getLat(), newIssue.getLng(),
                    existing.getLat(), existing.getLng()
            );

            if (distance <= duplicateRadiusMeters && distance < closestDistance) {
                closestMatch = existing;
                closestDistance = distance;
            }
        }

        return closestMatch;
    }

    private void saveReporter(Issue issue, User user, String imageUrl) {
        IssueReporter reporterRecord = new IssueReporter();
        reporterRecord.setIssue(issue);
        reporterRecord.setUser(user);
        reporterRecord.setImageUrl(imageUrl);
        issueReporterRepository.save(reporterRecord);
    }

    // 2. Citizen views only their own reports
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Issue>> getUserIssues(@PathVariable Long userId) {
        return ResponseEntity.ok(issueRepository.findByUserId(userId));
    }

    // 3. Admin views ALL reports for the dashboard
    @GetMapping("/all")
    public ResponseEntity<List<Issue>> getAllIssues() {
        return ResponseEntity.ok(issueRepository.findAll());
    }

    // 3b. Admin (or anyone) views every citizen who reported a given issue,
    //     along with each person's own photo/angle of it
    @GetMapping("/{issueId}/reporters")
    public ResponseEntity<List<IssueReporter>> getReportersForIssue(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueReporterRepository.findByIssueIdOrderByCreatedAtAsc(issueId));
    }

    // 4. Admin updates issue status and rewards citizens
    @PutMapping("/{issueId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long issueId, @RequestParam String status) {
        Optional<Issue> issueOptional = issueRepository.findById(issueId);

        if (issueOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Issue issue = issueOptional.get();
        issue.setStatus(status); // e.g., "IN_PROGRESS" or "RESOLVED"

        // Handle Citizen Reward System
        if ("RESOLVED".equalsIgnoreCase(status)) {
            User originalReporter = issue.getUser();
            originalReporter.setRewardPoints(originalReporter.getRewardPoints() + originalReportPoints);
            userRepository.save(originalReporter);

            // Everyone else whose report got merged into this issue also
            // gets a smaller reward for confirming/evidencing the problem
            List<IssueReporter> allReporters = issueReporterRepository.findByIssueIdOrderByCreatedAtAsc(issueId);
            for (IssueReporter ir : allReporters) {
                User contributor = ir.getUser();
                if (!contributor.getId().equals(originalReporter.getId())) {
                    contributor.setRewardPoints(contributor.getRewardPoints() + duplicateReportPoints);
                    userRepository.save(contributor);
                }
            }
        }

        return ResponseEntity.ok(issueRepository.save(issue));
    }
}
