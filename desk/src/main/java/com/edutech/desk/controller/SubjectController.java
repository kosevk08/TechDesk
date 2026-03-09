package com.edutech.desk.controller;

import com.edutech.desk.entities.Subject;
import com.edutech.desk.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subject")
@CrossOrigin("http://localhost:3000")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @GetMapping("/all")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable Long id) {
        Subject subject = subjectService.getSubjectById(id);
        if (subject != null) {
            return ResponseEntity.ok(subject);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/create")
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        return ResponseEntity.ok(subjectService.createSubject(subject));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        return ResponseEntity.ok(subjectService.updateSubject(id, subject));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok("Subject deleted successfully");
    }
}