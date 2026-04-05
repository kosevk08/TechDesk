package com.edutech.desk.repository;

import com.edutech.desk.entities.AiTaskData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiTaskDataRepository extends JpaRepository<AiTaskData, Long> {
}
