package com.edutech.desk.controller;

import com.edutech.desk.controller.request.AiGuidanceRequest;
import com.edutech.desk.controller.response.AiGuidanceResponse;
import com.edutech.desk.controller.response.AiParentDashboardResponse;
import com.edutech.desk.controller.response.AiTeacherDashboardResponse;
import jakarta.validation.Valid;
import com.edutech.desk.service.AIInsightsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIInsightsController {

    private final AIInsightsService aiInsightsService;

    public AIInsightsController(AIInsightsService aiInsightsService) {
        this.aiInsightsService = aiInsightsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AiTeacherDashboardResponse> getTeacherDashboard() {
        return ResponseEntity.ok(aiInsightsService.buildTeacherDashboard());
    }

    @GetMapping("/parent/{studentId}")
    public ResponseEntity<AiParentDashboardResponse> getParentDashboard(@PathVariable String studentId) {
        return ResponseEntity.ok(aiInsightsService.buildParentDashboard(studentId));
    }

    @PostMapping("/guidance")
    public ResponseEntity<AiGuidanceResponse> getGuidance(@Valid @RequestBody AiGuidanceRequest request) {
        return ResponseEntity.ok(aiInsightsService.buildStudentGuidance(request));
    }
}
