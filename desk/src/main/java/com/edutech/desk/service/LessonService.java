package com.edutech.desk.service;

import com.edutech.desk.entities.Lesson;
import java.util.List;

public interface LessonService {
    Lesson createLesson(Lesson lesson);
    Lesson getLessonById(Long id);
    List<Lesson> getLessonsByTeacher(String teacherEgn);
    List<Lesson> getLessonsByGrade(String grade);
    List<Lesson> getLessonsByClass(String className);
    List<Lesson> getLiveLessons();
    List<Lesson> getLessonsByStudent(String studentEgn);
    Lesson startLesson(Long id);
    Lesson endLesson(Long id);
    void deleteLesson(Long id);
}