package com.edutech.desk.repository;

import com.edutech.desk.entities.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, String> {
    Teacher findByEmail(String email);
    Teacher findByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);

    @Query(value = "SELECT subject FROM teacher_subjects WHERE teacher_egn = :egn", nativeQuery = true)
    List<String> findSubjectsByTeacherEgn(@Param("egn") String egn);
}
