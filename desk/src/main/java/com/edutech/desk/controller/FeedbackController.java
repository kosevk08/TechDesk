package com.edutech.desk.controller;

import com.edutech.desk.controller.request.FeedbackRequest;
import com.edutech.desk.entities.Feedback;
import com.edutech.desk.entities.User;
import com.edutech.desk.repository.FeedbackRepository;
import com.edutech.desk.service.CurrentUserService;
import com.edutech.desk.service.NameLookupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = {"http://localhost:3000", "https://techdesk-frontend.onrender.com"})
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    private NameLookupService nameLookupService;

    @PostMapping
    public ResponseEntity<Feedback> submit(@RequestBody FeedbackRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        User current = currentUserService.getUser();
        Feedback feedback = new Feedback();
        feedback.setMessage(request.getMessage().trim());
        feedback.setPage(request.getPage());
        feedback.setSeverity(request.getSeverity());
        feedback.setContact(request.getContact());

        if (current != null) {
            feedback.setUserEgn(current.getEgn());
            feedback.setRole(current.getRole().name());
            feedback.setUserDisplayName(nameLookupService.userDisplayName(current.getEgn()));
        }

        return ResponseEntity.ok(feedbackRepository.save(feedback));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Feedback>> all() {
        return ResponseEntity.ok(feedbackRepository.findAll());
    }
}
