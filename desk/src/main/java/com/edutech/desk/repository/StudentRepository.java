package com.edutech.desk.repository;

import com.edutech.desk.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    Student findByEmail(String email);
    Student findByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);
    List<Student> findByClassNameIgnoreCase(String className);
}
