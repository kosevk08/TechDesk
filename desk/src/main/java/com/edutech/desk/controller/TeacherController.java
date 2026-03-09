package com.edutech.desk.controller;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin("http://localhost:3000")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @GetMapping("/notebooks")
    public ResponseEntity<List<Notebook>> viewAllStudentNotebooks() {
        List<Notebook> notebooks = teacherService.getAllStudentNotebooks();
        return ResponseEntity.ok(notebooks);
    }

    @GetMapping("/notebook/{egn}")
    public ResponseEntity<Notebook> viewStudentNotebook(@PathVariable String egn) {
        Notebook notebook = teacherService.getStudentNotebook(egn);
        if (notebook != null) {
            return ResponseEntity.ok(notebook);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/attendance/{egn}")
    public ResponseEntity<String> markAttendance(
            @PathVariable String egn,
            @RequestParam boolean present) {
        teacherService.markAttendance(egn, present);
        return ResponseEntity.ok("Attendance recorded");
    }
}