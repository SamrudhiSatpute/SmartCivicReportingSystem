package com.example.demo.repository;

import com.example.demo.model.IssueReporter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueReporterRepository extends JpaRepository<IssueReporter, Long> {

    boolean existsByIssueIdAndUserId(Long issueId, Long userId);

    List<IssueReporter> findByIssueIdOrderByCreatedAtAsc(Long issueId);
}
