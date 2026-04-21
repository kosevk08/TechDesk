package com.edutech.desk.repository;

import com.edutech.desk.entities.NotebookAiRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotebookAiRecordRepository extends JpaRepository<NotebookAiRecord, Long> {
    Optional<NotebookAiRecord> findTopByStudentIdAndSubjectIdOrderByTimestampDesc(String studentId, String subjectId);
}
