package com.edutech.desk.controller;

import com.edutech.desk.controller.response.GradeResponse;
import com.edutech.desk.entities.Grade;
import com.edutech.desk.entities.User;
import com.edutech.desk.repository.UserRepository;
import com.edutech.desk.service.CurrentUserService;
import com.edutech.desk.service.GradeService;
import com.edutech.desk.service.NameLookupService;
import com.edutech.desk.service.NotificationService;
import com.edutech.desk.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/grades")
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

    @Autowired
    private TeacherService teacherService;

    @PostMapping
    public ResponseEntity<GradeResponse> addGrade(@RequestBody Map<String, String> body) {
        String studentName = body.get("studentName");
        String studentEgn = body.get("studentEgn");
        String subject = body.get("subject");
        if (studentEgn == null && studentName != null) {
            studentEgn = nameLookupService.studentEgnByName(studentName);
        }
        User teacher = currentUserService.getUser();
        if (studentEgn == null || teacher == null || subject == null || subject.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        List<String> teacherSubjects = teacherService.getTeacherSubjects(teacher.getEgn());
        boolean canGradeSubject = teacherSubjects.stream()
            .filter(s -> s != null && !s.isBlank())
            .anyMatch(s -> s.trim().equalsIgnoreCase(subject.trim()));
        if (!canGradeSubject) {
            return ResponseEntity.status(403).build();
        }
        Grade grade = new Grade();
        grade.setStudentEgn(studentEgn);
        grade.setSubject(subject.trim());
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        var gradeOpt = gradeService.getById(id);
        if (gradeOpt.isEmpty()) return ResponseEntity.notFound().build();
        Grade grade = gradeOpt.get();
        User actor = currentUserService.getUser();
        if (actor == null) return ResponseEntity.status(403).build();
        boolean allowed = actor.getRole() == com.edutech.desk.entities.Role.ADMIN
            || actor.getEgn().equals(grade.getTeacherEgn());
        if (!allowed) return ResponseEntity.status(403).build();
        gradeService.deleteGrade(id);
        return ResponseEntity.noContent().build();
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
        response.setId(grade.getId());
        response.setStudentName(nameLookupService.studentName(grade.getStudentEgn()));
        response.setSubject(grade.getSubject());
        response.setValue(grade.getValue());
        response.setComment(grade.getComment());
        response.setCreatedAt(grade.getCreatedAt());
        return response;
    }
}
