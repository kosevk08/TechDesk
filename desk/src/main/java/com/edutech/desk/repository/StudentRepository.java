package com.edutech.desk.repository;

import com.edutech.desk.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    Student findByEmail(String email);
}