package com.edutech.desk.controller;

import com.edutech.desk.controller.request.AiTaskDataRequest;
import jakarta.validation.Valid;
import com.edutech.desk.service.AITrackerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AITrackerController {

    private static final Logger logger = LoggerFactory.getLogger(AITrackerController.class);
    private final AITrackerService aiTrackerService;

    public AITrackerController(AITrackerService aiTrackerService) {
        this.aiTrackerService = aiTrackerService;
    }

    @PostMapping("/task-data")
    public ResponseEntity<Map<String, Object>> receiveTaskData(@Valid @RequestBody AiTaskDataRequest request) {
        try {
            aiTrackerService.trackTaskData(request);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "accepted");
            response.put("message", "Task data received for async tracking");
            return ResponseEntity.accepted().body(response);

        } catch (Exception ex) {
            logger.error("AITrackerController - unexpected error while tracking task data", ex);
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Task tracking failed, but main workflow continues.");
            return ResponseEntity.status(500).body(error);
        }
    }
}
