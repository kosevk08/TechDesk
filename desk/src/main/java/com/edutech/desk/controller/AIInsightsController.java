package com.edutech.desk.controller;

import com.edutech.desk.controller.request.AiGuidanceRequest;
import com.edutech.desk.controller.response.AiGuidanceResponse;
import com.edutech.desk.controller.response.AiParentDashboardResponse;
import com.edutech.desk.controller.response.AiTeacherDashboardResponse;
import jakarta.validation.Valid;
import com.edutech.desk.service.AIInsightsService;
import com.edutech.desk.service.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIInsightsController {

    private final AIInsightsService aiInsightsService;
    private final CurrentUserService currentUserService;

    public AIInsightsController(AIInsightsService aiInsightsService, CurrentUserService currentUserService) {
        this.aiInsightsService = aiInsightsService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AiTeacherDashboardResponse> getTeacherDashboard() {
        return ResponseEntity.ok(aiInsightsService.buildTeacherDashboard());
    }

    @GetMapping("/parent/{studentId}")
    public ResponseEntity<AiParentDashboardResponse> getParentDashboard(@PathVariable String studentId) {
        return ResponseEntity.ok(aiInsightsService.buildParentDashboard(studentId));
    }

    @GetMapping("/parent/me")
    public ResponseEntity<AiParentDashboardResponse> getParentDashboardForCurrent() {
        var user = currentUserService.getUser();
        if (user == null || user.getStudentEgn() == null) {
            return ResponseEntity.ok(new AiParentDashboardResponse());
        }
        return ResponseEntity.ok(aiInsightsService.buildParentDashboard(user.getStudentEgn()));
    }

    @PostMapping("/guidance")
    public ResponseEntity<AiGuidanceResponse> getGuidance(@Valid @RequestBody AiGuidanceRequest request) {
        return ResponseEntity.ok(aiInsightsService.buildStudentGuidance(request));
    }
}
