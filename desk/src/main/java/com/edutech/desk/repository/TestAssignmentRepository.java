package com.edutech.desk.repository;

import com.edutech.desk.entities.TestAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestAssignmentRepository extends JpaRepository<TestAssignment, Long> {
    List<TestAssignment> findByTestId(Long testId);
    List<TestAssignment> findByClassName(String className);
}
