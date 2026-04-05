package com.edutech.desk.repository;

import com.edutech.desk.entities.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByStudentEgn(String studentEgn);
    List<Grade> findByStudentEgnAndSubject(String studentEgn, String subject);
    List<Grade> findBySubject(String subject);
}
