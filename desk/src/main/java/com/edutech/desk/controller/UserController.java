package com.edutech.desk.controller;

import com.edutech.desk.entities.User;
import com.edutech.desk.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:3000", "https://techdesk-frontend.onrender.com"})
public class UserController {

    @Autowired
    private UserService userService;

    private final Map<String, AtomicInteger> failedAttempts = new ConcurrentHashMap<>();
    private final Map<String, Long> blockedIps = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION = 5 * 60 * 1000L;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User loginUser,
            @RequestHeader(value = "X-Forwarded-For", required = false) String forwarded,
            jakarta.servlet.http.HttpServletRequest request) {

        String ip = forwarded != null ? forwarded.split(",")[0].trim() : request.getRemoteAddr();

        if (blockedIps.containsKey(ip)) {
            long blockedAt = blockedIps.get(ip);
            if (System.currentTimeMillis() - blockedAt < BLOCK_DURATION) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
            } else {
                blockedIps.remove(ip);
                failedAttempts.remove(ip);
            }
        }

        String email = loginUser.getEmail();
        String password = loginUser.getPassword();

        if (email == null || password == null ||
            email.contains("<") || email.contains(">") ||
            email.contains("'") || email.contains("--") ||
            email.length() > 100 || password.length() > 100) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        User user = userService.login(email, password);
        if (user != null) {
            failedAttempts.remove(ip);
            return ResponseEntity.ok(user);
        }

        failedAttempts.computeIfAbsent(ip, k -> new AtomicInteger(0)).incrementAndGet();
        if (failedAttempts.get(ip).get() >= MAX_ATTEMPTS) {
            blockedIps.put(ip, System.currentTimeMillis());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        String result = userService.register(user);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/get/{egn}")
    public ResponseEntity<User> getUserByEgn(@PathVariable String egn) {
        User user = userService.getUserByEgn(egn);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        if (!"techdesk-secret-2026".equals(key)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/setup")
    public ResponseEntity<String> setupUsers(
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        if (!"techdesk-secret-2026".equals(key)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String[][] users = {
            {"1000000001", "v.kolev-student@edu-school.bg", "password123", "STUDENT"},
            {"1000000002", "k.kosev-student@edu-school.bg", "password123", "STUDENT"},
            {"1000000003", "i.ivanov-student@edu-school.bg", "password123", "STUDENT"},
            {"1000000004", "j.doe-student@edu-school.bg", "password123", "STUDENT"},
            {"1000000005", "d.kovacs-student@edu-school.bg", "password123", "STUDENT"},
            {"1000000006", "s.martinez-student@edu-school.bg", "password123", "STUDENT"},
            {"1000000007", "m.bennett-student@edu-school.bg", "password123", "STUDENT"},
            {"1000000008", "e.petrova-student@edu-school.bg", "password123", "STUDENT"},
            {"1000000009", "l.oconnor-student@edu-school.bg", "password123", "STUDENT"},
            {"1000000010", "v.ivanov-student@edu-school.bg", "password123", "STUDENT"},
            {"1000000011", "n.fischer-student@edu-school.bg", "password123", "STUDENT"},
            {"1000000012", "c.mendes-student@edu-school.bg", "password123", "STUDENT"},
            {"2000000001", "h.schmidt-teacher@edu-school.bg", "password123", "TEACHER"},
            {"2000000002", "a.popescu-teacher@edu-school.bg", "password123", "TEACHER"},
            {"3000000001", "l.navarro-parent@edu-school.bg", "password123", "PARENT"}
        };

        for (String[] u : users) {
            User user = new User();
            user.setEgn(u[0]);
            user.setEmail(u[1]);
            user.setPassword(u[2]);
            user.setRole(com.edutech.desk.entities.Role.valueOf(u[3]));
            userService.register(user);
        }
        return ResponseEntity.ok("All 15 users created successfully!");
    }
}