package com.edutech.desk.controller;

import com.edutech.desk.entities.Student;
import com.edutech.desk.entities.Subject;
import com.edutech.desk.controller.response.StudentPublicResponse;
import com.edutech.desk.service.CurrentUserService;
import com.edutech.desk.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/student")
@CrossOrigin("http://localhost:3000")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/get/{egn}")
    public ResponseEntity<StudentPublicResponse> getStudentByEgn(@PathVariable String egn) {
        Student student = studentService.getStudentByEgn(egn);
        if (student != null) {
            return ResponseEntity.ok(toPublic(student));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/subjects/{egn}")
    public ResponseEntity<Set<Subject>> getStudentSubjects(@PathVariable String egn) {
        Student student = studentService.getStudentByEgn(egn);
        if (student != null) {
            return ResponseEntity.ok(student.getSubjects());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/me")
    public ResponseEntity<StudentPublicResponse> getMyProfile() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.notFound().build();
        Student student = studentService.getStudentByEgn(egn);
        if (student == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(toPublic(student));
    }

    @GetMapping("/names")
    public ResponseEntity<List<StudentPublicResponse>> getStudentNames() {
        List<StudentPublicResponse> students = studentService.getAllStudents()
            .stream()
            .map(this::toPublic)
            .toList();
        return ResponseEntity.ok(students);
    }

    private StudentPublicResponse toPublic(Student student) {
        StudentPublicResponse response = new StudentPublicResponse();
        response.setFullName(student.getFirstName() + " " + student.getLastName());
        response.setClassName(student.getClassName());
        response.setGrade(student.getGrade());
        return response;
    }
}
