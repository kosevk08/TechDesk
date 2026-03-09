package com.edutech.desk.repository;

import com.edutech.desk.entities.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByTeacherEgn(String teacherEgn);
    List<Lesson> findByGrade(String grade);
    List<Lesson> findByClassName(String className);
    List<Lesson> findByIsLiveTrue();
    List<Lesson> findByStudentEgnsContaining(String studentEgn);
}