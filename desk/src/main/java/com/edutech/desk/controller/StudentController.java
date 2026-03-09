package com.edutech.desk.controller;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.entities.Student;
import com.edutech.desk.entities.Subject;
import com.edutech.desk.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Set;

@RestController
@RequestMapping("/api/student")
@CrossOrigin("http://localhost:3000")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping("/get/{egn}")
    public ResponseEntity<Student> getStudentByEgn(@PathVariable String egn) {
        Student student = studentService.getStudentByEgn(egn);
        if (student != null) {
            return ResponseEntity.ok(student);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/notebook/{egn}")
    public ResponseEntity<Notebook> getMyNotebook(@PathVariable String egn) {
        Notebook notebook = studentService.getNotebook(egn);
        if (notebook != null) {
            return ResponseEntity.ok(notebook);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/notebook/save")
    public ResponseEntity<String> saveMyNotebook(@RequestBody Notebook notebook) {
        studentService.saveNotebook(notebook);
        return ResponseEntity.ok("Notebook saved successfully");
    }

    @GetMapping("/subjects/{egn}")
    public ResponseEntity<Set<Subject>> getStudentSubjects(@PathVariable String egn) {
        Student student = studentService.getStudentByEgn(egn);
        if (student != null) {
            return ResponseEntity.ok(student.getSubjects());
        }
        return ResponseEntity.notFound().build();
    }
}