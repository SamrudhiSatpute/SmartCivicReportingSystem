package com.example.demo.controller;

import com.example.demo.model.Job;
import com.example.demo.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    // 1. Any logged-in user (citizen or admin) can view all jobs/contracts
    @GetMapping("/all")
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobRepository.findAll());
    }

    // 2. Admin creates a new job/contract
    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        return ResponseEntity.ok(jobRepository.save(job));
    }

    // 3. Admin updates an existing job/contract
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job jobDetails) {
        Optional<Job> jobOptional = jobRepository.findById(id);

        if (jobOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Job job = jobOptional.get();
        job.setTitle(jobDetails.getTitle());
        job.setDescription(jobDetails.getDescription());
        job.setCategory(jobDetails.getCategory());
        job.setLocation(jobDetails.getLocation());
        job.setBudget(jobDetails.getBudget());
        job.setStatus(jobDetails.getStatus());

        return ResponseEntity.ok(jobRepository.save(job));
    }

    // 4. Admin deletes a job/contract
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        if (!jobRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jobRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
