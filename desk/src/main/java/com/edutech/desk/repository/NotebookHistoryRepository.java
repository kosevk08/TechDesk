package com.edutech.desk.repository;

import com.edutech.desk.entities.NotebookHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotebookHistoryRepository extends JpaRepository<NotebookHistory, Long> {
    List<NotebookHistory> findByNotebookId(Long notebookId);
}