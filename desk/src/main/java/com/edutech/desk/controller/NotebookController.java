package com.edutech.desk.controller;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.service.NotebookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notebook")
@CrossOrigin("http://localhost:3000")
public class NotebookController {

    @Autowired
    private NotebookService notebookService;

    @GetMapping("/all")
    public ResponseEntity<List<Notebook>> getAllNotebooks() {
        return ResponseEntity.ok(notebookService.getAllNotebooks());
    }

    @GetMapping("/student/{egn}")
    public ResponseEntity<List<Notebook>> getNotebooksByStudent(@PathVariable String egn) {
        return ResponseEntity.ok(notebookService.getNotebooksByStudentEgn(egn));
    }

    @GetMapping("/student/{egn}/{subject}/{page}")
    public ResponseEntity<Notebook> getPage(@PathVariable String egn, @PathVariable String subject, @PathVariable int page) {
        Optional<Notebook> notebook = notebookService.getByStudentEgnAndSubjectAndPage(egn, subject, page);
        return notebook.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/save")
    public ResponseEntity<Notebook> saveNotebook(@RequestBody Notebook notebook) {
        Optional<Notebook> existing = notebookService.getByStudentEgnAndSubjectAndPage(
            notebook.getStudentEgn(), notebook.getSubject(), notebook.getPageNumber());
        notebook.setLastUpdated(LocalDateTime.now());
        if (existing.isPresent()) {
            return ResponseEntity.ok(notebookService.updateNotebook(existing.get().getId(), notebook));
        }
        return ResponseEntity.ok(notebookService.createNotebook(notebook));
    }

    @PostMapping("/create")
    public ResponseEntity<Notebook> createNotebook(@RequestBody Notebook notebook) {
        return ResponseEntity.ok(notebookService.createNotebook(notebook));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Notebook> updateNotebook(@PathVariable Long id, @RequestBody Notebook notebook) {
        return ResponseEntity.ok(notebookService.updateNotebook(id, notebook));
    }
}