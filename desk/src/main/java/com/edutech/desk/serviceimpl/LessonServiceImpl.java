package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.Lesson;
import com.edutech.desk.repository.LessonRepository;
import com.edutech.desk.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LessonServiceImpl implements LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Override
    public Lesson createLesson(Lesson lesson) {
        return lessonRepository.save(lesson);
    }

    @Override
    public Lesson getLessonById(Long id) {
        return lessonRepository.findById(id).orElse(null);
    }

    @Override
    public List<Lesson> getLessonsByTeacher(String teacherEgn) {
        return lessonRepository.findByTeacherEgn(teacherEgn);
    }

    @Override
    public List<Lesson> getLessonsByGrade(String grade) {
        return lessonRepository.findByGrade(grade);
    }

    @Override
    public List<Lesson> getLessonsByClass(String className) {
        return lessonRepository.findByClassName(className);
    }

    @Override
    public List<Lesson> getLiveLessons() {
        return lessonRepository.findByIsLiveTrue();
    }

    @Override
    public List<Lesson> getLessonsByStudent(String studentEgn) {
        return lessonRepository.findByStudentEgnsContaining(studentEgn);
    }

    @Override
    public Lesson startLesson(Long id) {
        Lesson lesson = lessonRepository.findById(id).orElse(null);
        if (lesson != null) {
            lesson.setLive(true);
            return lessonRepository.save(lesson);
        }
        return null;
    }

    @Override
    public Lesson endLesson(Long id) {
        Lesson lesson = lessonRepository.findById(id).orElse(null);
        if (lesson != null) {
            lesson.setLive(false);
            return lessonRepository.save(lesson);
        }
        return null;
    }

    @Override
    public void deleteLesson(Long id) {
        lessonRepository.deleteById(id);
    }
}