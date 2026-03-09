package com.edutech.desk.repository;

import com.edutech.desk.entities.Notebook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotebookRepository extends JpaRepository<Notebook, Long> {
    List<Notebook> findByStudentEgn(String studentEgn);
    Optional<Notebook> findByStudentEgnAndSubjectAndPageNumber(String studentEgn, String subject, int pageNumber);
}