package com.edutech.desk.controller;

import com.edutech.desk.controller.response.NotebookResponse;
import com.edutech.desk.entities.Notebook;
import com.edutech.desk.service.CurrentUserService;
import com.edutech.desk.service.NameLookupService;
import com.edutech.desk.service.NotebookService;
import com.edutech.desk.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notebook")
@CrossOrigin("http://localhost:3000")
public class NotebookController {

    @Autowired
    private NotebookService notebookService;

    @Autowired
    private NameLookupService nameLookupService;

    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    private TeacherService teacherService;

    @GetMapping("/all")
    public ResponseEntity<List<NotebookResponse>> getAllNotebooks() {
        List<NotebookResponse> responses = notebookService.getAllNotebooks()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/{egn}")
    public ResponseEntity<List<NotebookResponse>> getNotebooksByStudent(@PathVariable String egn) {
        List<NotebookResponse> responses = notebookService.getNotebooksByStudentEgn(egn)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/me")
    public ResponseEntity<List<NotebookResponse>> getMyNotebooks() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(List.of());
        List<NotebookResponse> responses = notebookService.getNotebooksByStudentEgn(egn)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/child")
    public ResponseEntity<List<NotebookResponse>> getChildNotebooks() {
        var user = currentUserService.getUser();
        if (user == null || user.getStudentEgn() == null) return ResponseEntity.ok(List.of());
        List<NotebookResponse> responses = notebookService.getNotebooksByStudentEgn(user.getStudentEgn())
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/teacher")
    public ResponseEntity<List<NotebookResponse>> getTeacherNotebooks() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(List.of());
        List<String> subjects = teacherService.getTeacherSubjects(egn);
        List<NotebookResponse> responses = notebookService.getNotebooksBySubjects(subjects)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/{egn}/{subject}/{page}")
    public ResponseEntity<NotebookResponse> getPage(@PathVariable String egn, @PathVariable String subject, @PathVariable int page) {
        Optional<Notebook> notebook = notebookService.getByStudentEgnAndSubjectAndPage(egn, subject, page);
        return notebook.map(n -> ResponseEntity.ok(toResponse(n))).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me/{subject}/{page}")
    public ResponseEntity<NotebookResponse> getMyPage(@PathVariable String subject, @PathVariable int page) {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.notFound().build();
        Optional<Notebook> notebook = notebookService.getByStudentEgnAndSubjectAndPage(egn, subject, page);
        return notebook.map(n -> ResponseEntity.ok(toResponse(n))).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/name/{name}/{subject}/{page}")
    public ResponseEntity<NotebookResponse> getPageByStudentName(@PathVariable String name, @PathVariable String subject, @PathVariable int page) {
        String egn = nameLookupService.studentEgnByName(name);
        if (egn == null) return ResponseEntity.notFound().build();
        Optional<Notebook> notebook = notebookService.getByStudentEgnAndSubjectAndPage(egn, subject, page);
        return notebook.map(n -> ResponseEntity.ok(toResponse(n))).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/save/me")
    public ResponseEntity<NotebookResponse> saveMyNotebook(@RequestBody Notebook notebook) {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.badRequest().build();
        notebook.setStudentEgn(egn);
        Optional<Notebook> existing = notebookService.getByStudentEgnAndSubjectAndPage(
            notebook.getStudentEgn(), notebook.getSubject(), notebook.getPageNumber());
        notebook.setLastUpdated(LocalDateTime.now());
        Notebook saved = existing.isPresent()
            ? notebookService.updateNotebook(existing.get().getId(), notebook)
            : notebookService.createNotebook(notebook);
        return ResponseEntity.ok(toResponse(saved));
    }

    private NotebookResponse toResponse(Notebook notebook) {
        NotebookResponse response = new NotebookResponse();
        response.setId(notebook.getId());
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
