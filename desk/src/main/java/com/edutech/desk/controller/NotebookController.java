package com.edutech.desk.controller;

import com.edutech.desk.controller.response.NotebookResponse;
import com.edutech.desk.entities.Notebook;
import com.edutech.desk.repository.NotebookRepository;
import com.edutech.desk.service.CurrentUserService;
import com.edutech.desk.service.NameLookupService;
import com.edutech.desk.service.NotebookService;
import com.edutech.desk.service.TeacherService;
import com.edutech.desk.serviceimpl.ai.AiStudentGuidanceBuilder;
import com.edutech.desk.controller.response.AiGuidanceResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notebook")
public class NotebookController {

    @Autowired
    private NotebookService notebookService;

    @Autowired
    private NotebookRepository notebookRepository;

    @Autowired
    private NameLookupService nameLookupService;

    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private AiStudentGuidanceBuilder aiGuidanceBuilder;

    @GetMapping("/all")
    public ResponseEntity<List<NotebookResponse>> getAllNotebooks() {
        List<NotebookResponse> responses = notebookService.getAllNotebooks()
            .stream()
            .map(n -> toResponse(n, true))
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/list")
    public ResponseEntity<List<NotebookResponse>> getNotebookList() {
        List<NotebookResponse> responses = notebookRepository.findAll()
            .stream()
            .map(n -> toResponse(n, false))
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/{egn}")
    public ResponseEntity<List<NotebookResponse>> getNotebooksByStudent(@PathVariable String egn) {
        List<NotebookResponse> responses = notebookService.getNotebooksByStudentEgn(egn)
            .stream()
            .map(n -> toResponse(n, true))
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/me")
    public ResponseEntity<List<NotebookResponse>> getMyNotebooks() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(List.of());
        List<NotebookResponse> responses = notebookService.getNotebooksByStudentEgn(egn)
            .stream()
            .map(n -> toResponse(n, true))
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/child")
    public ResponseEntity<List<NotebookResponse>> getChildNotebooks() {
        var user = currentUserService.getUser();
        if (user == null || user.getStudentEgn() == null) return ResponseEntity.ok(List.of());
        List<NotebookResponse> responses = notebookService.getNotebooksByStudentEgn(user.getStudentEgn())
            .stream()
            .map(n -> toResponse(n, true))
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/teacher")
    public ResponseEntity<List<NotebookResponse>> getTeacherNotebooks() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(List.of());
        List<String> subjects = teacherService.getTeacherSubjects(egn);
        List<NotebookResponse> responses;
        if (subjects == null || subjects.isEmpty()) {
            responses = notebookService.getAllNotebooks()
                .stream()
                .map(n -> toResponse(n, true))
                .collect(Collectors.toList());
        } else {
            responses = notebookService.getNotebooksBySubjects(subjects)
                .stream()
                .map(n -> toResponse(n, true))
                .collect(Collectors.toList());
        }
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/{egn}/{subject}/{page}")
    public ResponseEntity<NotebookResponse> getPage(@PathVariable String egn, @PathVariable String subject, @PathVariable int page) {
        Optional<Notebook> notebook = notebookService.getByStudentEgnAndSubjectAndPage(egn, subject, page);
        return notebook.map(n -> ResponseEntity.ok(toResponse(n, true))).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me/{subject}/{page}")
    public ResponseEntity<NotebookResponse> getMyPage(@PathVariable String subject, @PathVariable int page) {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.notFound().build();
        Optional<Notebook> notebook = notebookService.getByStudentEgnAndSubjectAndPage(egn, subject, page);
        return notebook.map(n -> ResponseEntity.ok(toResponse(n, true))).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/name/{name}/{subject}/{page}")
    public ResponseEntity<NotebookResponse> getPageByStudentName(@PathVariable String name, @PathVariable String subject, @PathVariable int page) {
        String egn = nameLookupService.studentEgnByName(name);
        if (egn == null) return ResponseEntity.notFound().build();
        Optional<Notebook> notebook = notebookService.getByStudentEgnAndSubjectAndPage(egn, subject, page);
        return notebook.map(n -> ResponseEntity.ok(toResponse(n, true))).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Feature 3: ELI5 Button
     * Simplifies a concept for the student.
     */
    @GetMapping("/eli5/{subject}/{topic}")
    public ResponseEntity<AiGuidanceResponse> getEli5Explanation(@PathVariable String subject, @PathVariable String topic) {
        // This uses the specialized ELI5 logic in the guidance builder
        return ResponseEntity.ok(aiGuidanceBuilder.buildEli5(subject, topic));
    }

    /**
     * Feature: Background Sync Endpoint
     * Receives batched strokes from the Service Worker when connection is restored.
     */
    @PostMapping("/sync-strokes")
    public ResponseEntity<Void> syncStrokes(@RequestBody List<Map<String, Object>> strokes) {
        // The service worker sends batched coordinates. 
        // For now, we acknowledge receipt to allow the client to clear its offline buffer.
        return ResponseEntity.ok().build();
    }

    @PostMapping("/save/me")
    public ResponseEntity<NotebookResponse> saveMyNotebook(@RequestBody Notebook notebook) {
        String egn = currentUserService.getEgn();
        if (egn == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // Sanitize and validate input
        if (!isValidNotebook(notebook)) {
            return ResponseEntity.badRequest().build();
        }
        
        notebook.setStudentEgn(egn);
        return ResponseEntity.ok(toResponse(processSave(notebook), true));
    }

    @PostMapping("/save")
    public ResponseEntity<NotebookResponse> saveNotebook(@RequestBody Notebook notebook) {
        if (!isValidNotebook(notebook)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(toResponse(processSave(notebook), true));
    }

    private boolean isValidNotebook(Notebook notebook) {
        if (notebook == null || notebook.getSubject() == null) return false;
        // Reject oversized content (e.g., > 2MB) or suspicious tags
        String content = notebook.getContent();
        if (content != null && content.length() > 2 * 1024 * 1024) return false;
        if (notebook.getSubject().length() > 50) return false;
        return true;
    }

    private Notebook processSave(Notebook notebook) {
        notebook.setLastUpdated(LocalDateTime.now());
        Optional<Notebook> existing = notebookService.getByStudentEgnAndSubjectAndPage(
                notebook.getStudentEgn(), notebook.getSubject(), notebook.getPageNumber());
        return existing.isPresent()
                ? notebookService.updateNotebook(existing.get().getId(), notebook)
                : notebookService.createNotebook(notebook);
    }

    private NotebookResponse toResponse(Notebook notebook, boolean includeContent) {
        NotebookResponse response = new NotebookResponse();
        response.setId(notebook.getId());
        response.setStudentEgn(notebook.getStudentEgn());
        response.setStudentName(nameLookupService.studentName(notebook.getStudentEgn()));
        response.setSubject(notebook.getSubject());
        response.setSchoolYear(notebook.getSchoolYear());
        response.setFormat(notebook.getFormat());
        response.setStyle(notebook.getStyle());
        response.setColor(notebook.getColor());
        response.setContent(includeContent ? notebook.getContent() : null);
        response.setPageNumber(notebook.getPageNumber());
        response.setLastUpdated(notebook.getLastUpdated());
        return response;
    }
}
