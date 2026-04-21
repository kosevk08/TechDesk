package com.edutech.desk.controller;

import com.edutech.desk.ai.notebook.NotebookAiPipelineService;
import com.edutech.desk.controller.request.NotebookAiAnalyzeRequest;
import com.edutech.desk.controller.response.NotebookAiAnalyzeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notebook/ai")
public class NotebookAiController {
    private final NotebookAiPipelineService notebookAiPipelineService;

    public NotebookAiController(NotebookAiPipelineService notebookAiPipelineService) {
        this.notebookAiPipelineService = notebookAiPipelineService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<NotebookAiAnalyzeResponse> analyze(@RequestBody NotebookAiAnalyzeRequest request) {
        return ResponseEntity.ok(notebookAiPipelineService.analyze(request));
    }

    @GetMapping("/latest/{studentId}/{subjectId}")
    public ResponseEntity<NotebookAiAnalyzeResponse> latest(@PathVariable String studentId, @PathVariable String subjectId) {
        return notebookAiPipelineService.latest(studentId, subjectId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}

