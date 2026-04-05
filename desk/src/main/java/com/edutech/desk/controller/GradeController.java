package com.edutech.desk.controller;

import com.edutech.desk.controller.response.GradeResponse;
import com.edutech.desk.entities.Grade;
import com.edutech.desk.entities.User;
import com.edutech.desk.repository.UserRepository;
import com.edutech.desk.service.CurrentUserService;
import com.edutech.desk.service.GradeService;
import com.edutech.desk.service.NameLookupService;
import com.edutech.desk.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = {"http://localhost:3000", "https://techdesk-frontend.onrender.com"})
public class GradeController {

    @Autowired
    private GradeService gradeService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NameLookupService nameLookupService;

    @Autowired
    private CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<GradeResponse> addGrade(@RequestBody Map<String, String> body) {
        String studentName = body.get("studentName");
        String studentEgn = body.get("studentEgn");
        if (studentEgn == null && studentName != null) {
            studentEgn = nameLookupService.studentEgnByName(studentName);
        }
        User teacher = currentUserService.getUser();
        if (studentEgn == null || teacher == null) {
            return ResponseEntity.badRequest().build();
        }
        Grade grade = new Grade();
        grade.setStudentEgn(studentEgn);
        grade.setSubject(body.get("subject"));
        grade.setValue(Double.parseDouble(body.get("value")));
        grade.setComment(body.getOrDefault("comment", ""));
        grade.setTeacherEgn(teacher.getEgn());
        Grade saved = gradeService.addGrade(grade);
        notificationService.create(saved.getStudentEgn(), "GRADE",
            "New grade in " + saved.getSubject() + ": " + saved.getValue());
        User parent = userRepository.findByStudentEgn(saved.getStudentEgn());
        if (parent != null) {
            notificationService.create(parent.getEgn(), "GRADE",
                "New grade for your child in " + saved.getSubject() + ": " + saved.getValue());
        }
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/student/{egn}")
    public ResponseEntity<List<GradeResponse>> getByStudent(@PathVariable String egn) {
        List<GradeResponse> responses = gradeService.getByStudent(egn)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/me")
    public ResponseEntity<List<GradeResponse>> getMyGrades() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(List.of());
        List<GradeResponse> responses = gradeService.getByStudent(egn)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/name/{name}")
    public ResponseEntity<List<GradeResponse>> getByStudentName(@PathVariable String name) {
        String studentEgn = nameLookupService.studentEgnByName(name);
        if (studentEgn == null) return ResponseEntity.ok(List.of());
        List<GradeResponse> responses = gradeService.getByStudent(studentEgn)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/{egn}/subject/{subject}")
    public ResponseEntity<List<GradeResponse>> getByStudentSubject(@PathVariable String egn, @PathVariable String subject) {
        List<GradeResponse> responses = gradeService.getByStudentAndSubject(egn, subject)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/{egn}/averages")
    public ResponseEntity<Map<String, Double>> getStudentAverages(@PathVariable String egn) {
        return ResponseEntity.ok(gradeService.getStudentAverages(egn));
    }

    @GetMapping("/student/me/averages")
    public ResponseEntity<Map<String, Double>> getMyAverages() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(Map.of());
        return ResponseEntity.ok(gradeService.getStudentAverages(egn));
    }

    @GetMapping("/student/name/{name}/averages")
    public ResponseEntity<Map<String, Double>> getAveragesByName(@PathVariable String name) {
        String studentEgn = nameLookupService.studentEgnByName(name);
        if (studentEgn == null) return ResponseEntity.ok(Map.of());
        return ResponseEntity.ok(gradeService.getStudentAverages(studentEgn));
    }

    private GradeResponse toResponse(Grade grade) {
        GradeResponse response = new GradeResponse();
        response.setStudentName(nameLookupService.studentName(grade.getStudentEgn()));
        response.setSubject(grade.getSubject());
        response.setValue(grade.getValue());
        response.setComment(grade.getComment());
        response.setCreatedAt(grade.getCreatedAt());
        return response;
    }
}
