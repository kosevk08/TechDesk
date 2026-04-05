package com.edutech.desk.repository;

import com.edutech.desk.entities.TestSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TestSubmissionRepository extends JpaRepository<TestSubmission, Long> {
    List<TestSubmission> findByTestId(Long testId);
    List<TestSubmission> findByStudentEgn(String studentEgn);
    Optional<TestSubmission> findByTestIdAndStudentEgn(Long testId, String studentEgn);
}
