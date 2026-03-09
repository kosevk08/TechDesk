package com.edutech.desk.controller;

import com.edutech.desk.entities.Lesson;
import com.edutech.desk.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lesson")
@CrossOrigin("http://localhost:3000")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @PostMapping("/create")
    public ResponseEntity<Lesson> createLesson(@RequestBody Lesson lesson) {
        return ResponseEntity.ok(lessonService.createLesson(lesson));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lesson> getLesson(@PathVariable Long id) {
        Lesson lesson = lessonService.getLessonById(id);
        if (lesson != null) {
            return ResponseEntity.ok(lesson);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/teacher/{egn}")
    public ResponseEntity<List<Lesson>> getByTeacher(@PathVariable String egn) {
        return ResponseEntity.ok(lessonService.getLessonsByTeacher(egn));
    }

    @GetMapping("/grade/{grade}")
    public ResponseEntity<List<Lesson>> getByGrade(@PathVariable String grade) {
        return ResponseEntity.ok(lessonService.getLessonsByGrade(grade));
    }

    @GetMapping("/class/{className}")
    public ResponseEntity<List<Lesson>> getByClass(@PathVariable String className) {
        return ResponseEntity.ok(lessonService.getLessonsByClass(className));
    }

    @GetMapping("/live")
    public ResponseEntity<List<Lesson>> getLiveLessons() {
        return ResponseEntity.ok(lessonService.getLiveLessons());
    }

    @GetMapping("/student/{egn}")
    public ResponseEntity<List<Lesson>> getByStudent(@PathVariable String egn) {
        return ResponseEntity.ok(lessonService.getLessonsByStudent(egn));
    }

    @PutMapping("/start/{id}")
    public ResponseEntity<Lesson> startLesson(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.startLesson(id));
    }

    @PutMapping("/end/{id}")
    public ResponseEntity<Lesson> endLesson(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.endLesson(id));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.ok("Lesson deleted successfully");
    }
}