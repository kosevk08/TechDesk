package com.edutech.desk.repository;

import com.edutech.desk.entities.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentEgn(String studentEgn);
    List<Attendance> findByDate(LocalDate date);
    Optional<Attendance> findByStudentEgnAndDate(String studentEgn, LocalDate date);
}