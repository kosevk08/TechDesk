package com.edutech.desk.controller;

import com.edutech.desk.controller.response.NotebookResponse;
import com.edutech.desk.controller.request.TeacherSubjectsRequest;
import com.edutech.desk.entities.Notebook;
import com.edutech.desk.entities.Teacher;
import com.edutech.desk.service.NameLookupService;
import com.edutech.desk.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin("http://localhost:3000")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private NameLookupService nameLookupService;

    @GetMapping("/notebooks")
    public ResponseEntity<List<NotebookResponse>> viewAllStudentNotebooks() {
        List<NotebookResponse> notebooks = teacherService.getAllStudentNotebooks()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(notebooks);
    }

    @GetMapping("/notebook/{egn}")
    public ResponseEntity<NotebookResponse> viewStudentNotebook(@PathVariable String egn) {
        Notebook notebook = teacherService.getStudentNotebook(egn);
        if (notebook != null) {
            return ResponseEntity.ok(toResponse(notebook));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @PostMapping("/subjects")
    public ResponseEntity<Teacher> updateSubjects(@RequestBody TeacherSubjectsRequest request) {
        if (request == null || request.getTeacherEgn() == null) {
            return ResponseEntity.badRequest().build();
        }
        Teacher updated = teacherService.updateTeacherSubjects(request.getTeacherEgn(), request.getSubjects());
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/attendance/{egn}")
    public ResponseEntity<String> markAttendance(
            @PathVariable String egn,
            @RequestParam boolean present) {
        teacherService.markAttendance(egn, present);
        return ResponseEntity.ok("Attendance recorded");
    }

    private NotebookResponse toResponse(Notebook notebook) {
        NotebookResponse response = new NotebookResponse();
        response.setId(notebook.getId());
        response.setStudentEgn(notebook.getStudentEgn());
        response.setStudentName(nameLookupService.studentName(notebook.getStudentEgn()));
        response.setSubject(notebook.getSubject());
        response.setSchoolYear(notebook.getSchoolYear());
        response.setFormat(notebook.getFormat());
        response.setStyle(notebook.getStyle());
        response.setColor(notebook.getColor());
        response.setContent(notebook.getContent());
        response.setPageNumber(notebook.getPageNumber());
        response.setLastUpdated(notebook.getLastUpdated());
        return response;
    }
}
