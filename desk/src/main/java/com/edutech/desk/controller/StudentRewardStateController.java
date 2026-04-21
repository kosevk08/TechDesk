package com.edutech.desk.controller;

import com.edutech.desk.entities.Role;
import com.edutech.desk.entities.StudentRewardState;
import com.edutech.desk.entities.User;
import com.edutech.desk.repository.StudentRewardStateRepository;
import com.edutech.desk.service.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student/rewards")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "https://techdesk-frontend.onrender.com", "https://techdesk.onrender.com"})
public class StudentRewardStateController {

    private final StudentRewardStateRepository rewardStateRepository;
    private final CurrentUserService currentUserService;

    public StudentRewardStateController(StudentRewardStateRepository rewardStateRepository,
                                        CurrentUserService currentUserService) {
        this.rewardStateRepository = rewardStateRepository;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyRewards() {
        User user = currentUserService.getUser();
        if (user == null || user.getRole() != Role.STUDENT || user.getEgn() == null) {
            return ResponseEntity.status(403).build();
        }
        StudentRewardState state = rewardStateRepository.findById(user.getEgn()).orElseGet(() -> {
            StudentRewardState seed = new StudentRewardState();
            seed.setStudentEgn(user.getEgn());
            seed.setXp(0);
            seed.setStreak(1);
            seed.setTestsSubmitted(0);
            seed.setPracticeRounds(0);
            seed.setBadgesJson("[]");
            seed.setRewardedTestIdsJson("[]");
            seed.setUpdatedAt(LocalDateTime.now());
            return rewardStateRepository.save(seed);
        });

        return ResponseEntity.ok(Map.of(
            "xp", state.getXp(),
            "streak", state.getStreak(),
            "testsSubmitted", state.getTestsSubmitted(),
            "practiceRounds", state.getPracticeRounds(),
            "badges", parseJsonArray(state.getBadgesJson()),
            "rewardedTestIds", parseJsonArray(state.getRewardedTestIdsJson())
        ));
    }

    @PostMapping("/me")
    public ResponseEntity<Map<String, String>> saveMyRewards(@RequestBody Map<String, Object> body) {
        User user = currentUserService.getUser();
        if (user == null || user.getRole() != Role.STUDENT || user.getEgn() == null) {
            return ResponseEntity.status(403).build();
        }
        StudentRewardState state = rewardStateRepository.findById(user.getEgn()).orElseGet(StudentRewardState::new);
        state.setStudentEgn(user.getEgn());
        state.setXp(parseInt(body.get("xp"), 0));
        state.setStreak(parseInt(body.get("streak"), 1));
        state.setTestsSubmitted(parseInt(body.get("testsSubmitted"), 0));
        state.setPracticeRounds(parseInt(body.get("practiceRounds"), 0));
        state.setBadgesJson(stringifyJsonArray(body.get("badges")));
        state.setRewardedTestIdsJson(stringifyJsonArray(body.get("rewardedTestIds")));
        state.setUpdatedAt(LocalDateTime.now());
        rewardStateRepository.save(state);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    private int parseInt(Object value, int fallback) {
        if (value == null) return fallback;
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception ignored) {
            return fallback;
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank()) return List.of();
        String trimmed = json.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            String body = trimmed.substring(1, trimmed.length() - 1).trim();
            if (body.isEmpty()) return List.of();
            return java.util.Arrays.stream(body.split(","))
                .map(s -> s.trim().replaceAll("^\"|\"$", ""))
                .filter(s -> !s.isBlank())
                .toList();
        }
        return List.of();
    }

    private String stringifyJsonArray(Object value) {
        if (!(value instanceof List<?> raw)) return "[]";
        String joined = raw.stream()
            .map(String::valueOf)
            .map(s -> s.replace("\"", "\\\""))
            .map(s -> "\"" + s + "\"")
            .collect(java.util.stream.Collectors.joining(","));
        return "[" + joined + "]";
    }
}
