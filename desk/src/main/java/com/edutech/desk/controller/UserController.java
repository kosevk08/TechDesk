package com.edutech.desk.controller;

import com.edutech.desk.entities.User;
import com.edutech.desk.entities.Role;
import com.edutech.desk.controller.response.UserPublicResponse;
import com.edutech.desk.entities.Student;
import com.edutech.desk.repository.StudentRepository;
import com.edutech.desk.service.NameLookupService;
import com.edutech.desk.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5500", "http://127.0.0.1:5500", "https://techdesk-frontend.onrender.com"})
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private NameLookupService nameLookupService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Map<String, AtomicInteger> failedAttempts = new ConcurrentHashMap<>();
    private final Map<String, Long> blockedIps = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION = 15 * 60 * 1000L;

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

    private boolean isSanitized(String input) {
        if (input == null) return true;
        String lower = input.toLowerCase();
        return !lower.contains("<script") && !lower.contains("select ") && !lower.contains("drop ");
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<UserPublicResponse> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(toPublicUser(user));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/role/{id}")
    public ResponseEntity<Void> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        String adminSecret = System.getenv("TECHDESK_ADMIN_KEY");
        if (adminSecret == null) adminSecret = "techdesk-secret-2026";

        if (!adminSecret.equals(key)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String newRole = body.get("role");
        if (newRole == null || !isSanitized(newRole)) {
            return ResponseEntity.badRequest().build();
        }
        User userToUpdate = userService.getUserById(id);
        if (userToUpdate != null) {
            userToUpdate.setRole(Role.valueOf(newRole));
            userService.register(userToUpdate);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        String adminSecret = System.getenv("TECHDESK_ADMIN_KEY");
        if (adminSecret == null) adminSecret = "techdesk-secret-2026";

        if (!adminSecret.equals(key)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/setup")
    public ResponseEntity<String> setupUsers(
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        String adminSecret = System.getenv("TECHDESK_ADMIN_KEY");
        if (adminSecret == null) adminSecret = "techdesk-secret-2026";

        if (!adminSecret.equals(key)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String[][] users = {
            {"1000000001", "v.kolev-student@edu-school.bg", "password123", "STUDENT", "false", "Victor Kolev"},
            {"1000000002", "k.kosev-student@edu-school.bg", "password123", "STUDENT", "false", "Konstantin Kosev"},
            {"1000000003", "i.ivanov-student@edu-school.bg", "password123", "STUDENT", "false", "Ivan Ivanov"},
            {"1000000004", "j.doe-student@edu-school.bg", "password123", "STUDENT", "false", "John Doe"},
            {"1000000005", "d.kovacs-student@edu-school.bg", "password123", "STUDENT", "false", "Daniel Kovacs"},
            {"1000000006", "s.martinez-student@edu-school.bg", "password123", "STUDENT", "false", "Sofia Martinez"},
            {"1000000007", "m.bennett-student@edu-school.bg", "password123", "STUDENT", "false", "Marcus Bennett"},
            {"1000000008", "e.petrova-student@edu-school.bg", "password123", "STUDENT", "false", "Elena Petrova"},
            {"1000000009", "l.oconnor-student@edu-school.bg", "password123", "STUDENT", "false", "Liam O'Connor"},
            {"1000000010", "v.ivanov-student@edu-school.bg", "password123", "STUDENT", "false", "Victor Ivanov"},
            {"1000000011", "n.fischer-student@edu-school.bg", "password123", "STUDENT", "false", "Natalie Fischer"},
            {"1000000012", "c.mendes-student@edu-school.bg", "password123", "STUDENT", "false", "Carlos Mendes"},
            {"2000000001", "h.schmidt-teacher@edu-school.bg", "password123", "TEACHER", "false", "Miss Schmidt"},
            {"2000000002", "a.popescu-teacher@edu-school.bg", "password123", "TEACHER", "false", "Mr Popescu"},
            {"2000000003", "m.ivanova-maths@edu-school.bg", "password123", "TEACHER", "false", "Ms Ivanova"},
            {"2000000004", "p.georgiev-physics@edu-school.bg", "password123", "TEACHER", "false", "Mr Georgiev"},
            {"2000000005", "l.stoyanova-chem@edu-school.bg", "password123", "TEACHER", "false", "Ms Stoyanova"},
            {"2000000006", "d.petrov-biology@edu-school.bg", "password123", "TEACHER", "false", "Mr Petrov"},
            {"2000000007", "s.martin-english@edu-school.bg", "password123", "TEACHER", "false", "Mr Martin"},
            {"2000000008", "t.vasileva-bulgarian@edu-school.bg", "password123", "TEACHER", "false", "Ms Vasileva"},
            {"2000000009", "g.stefanov-geography@edu-school.bg", "password123", "TEACHER", "false", "Mr Stefanov"},
            {"2000000010", "r.dimitrova-philosophy@edu-school.bg", "password123", "TEACHER", "false", "Ms Dimitrova"},
            {"2000000011", "n.koleva-englishlit@edu-school.bg", "password123", "TEACHER", "false", "Ms Koleva"},
            {"2000000012", "v.georgieva-german@edu-school.bg", "password123", "TEACHER", "false", "Ms Georgieva"},
            {"2000000013", "i.karaslavova-spanish@edu-school.bg", "password123", "TEACHER", "false", "Ms Karaslavova"},
            {"2000000014", "e.nikolova-anthro@edu-school.bg", "password123", "TEACHER", "false", "Ms Nikolova"},
            {"3000000001", "l.navarro-parent@edu-school.bg", "password123", "PARENT", "false", "Luis Navarro"},
            {"4000000001", "admin@edu-school.bg", "password123", "ADMIN", "false", "System Admin"},
            {"9000000001", "r.paskalev-student@edu-school.bg", "pass@2026", "STUDENT", "true", "Radoslav Paskalev"},
            {"9000000002", "e.vasileva-teacher@edu-school.bg", "pass@2026", "TEACHER", "true", "Elena Vasileva"},
            {"9000000003", "p.stoyanov-parent@edu-school.bg", "pass@2026", "PARENT", "true", "Petar Stoyanov"},
            {"9000000004", "s.markova-admin@edu-school.bg", "pass@2026", "ADMIN", "true", "Sofia Markova"}
        };

        for (String[] u : users) {
            User user = new User();
            user.setEgn(u[0]);
            user.setEmail(u[1]);
            user.setPassword(passwordEncoder.encode(u[2]));
            user.setRole(Role.valueOf(u[3]));
            user.setDemo(Boolean.parseBoolean(u[4]));
            user.setDisplayName(u[5]);
            userService.register(user);
        }
        return ResponseEntity.ok("All users created successfully!");
    }

    private UserPublicResponse toPublicUser(User user) {
        UserPublicResponse response = new UserPublicResponse();
        String name = user.getDisplayName();
        if (name == null || name.isBlank()) {
            name = nameLookupService.userDisplayName(user.getEgn());
        }
        response.setDisplayName(name);
        response.setRole(user.getRole().name());
        response.setDemo(user.isDemo());

        if (Role.STUDENT.equals(user.getRole())) {
            Student student = studentRepository.findById(user.getEgn() != null ? user.getEgn() : "").orElse(null);
            response.setClassName(student != null ? student.getClassName() : null);
        } else if (Role.PARENT.equals(user.getRole()) && user.getStudentEgn() != null) {
            response.setChildName(nameLookupService.studentName(user.getStudentEgn()));
            Student child = studentRepository.findById(user.getStudentEgn()).orElse(null);
            if (child != null) {
                response.setChildClassName(child.getClassName());
            }
        }
        return response;
    }
}