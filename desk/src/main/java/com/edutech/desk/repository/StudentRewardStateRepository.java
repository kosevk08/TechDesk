package com.edutech.desk.repository;

import com.edutech.desk.entities.StudentRewardState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRewardStateRepository extends JpaRepository<StudentRewardState, String> {
}
