package com.edutech.desk.controller;

import com.edutech.desk.entities.User;
import com.edutech.desk.entities.Role;
import com.edutech.desk.entities.Student;
import com.edutech.desk.entities.Teacher;
import com.edutech.desk.entities.Parent;
import com.edutech.desk.repository.StudentRepository;
import com.edutech.desk.repository.TeacherRepository;
import com.edutech.desk.repository.ParentRepository;
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
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "https://techdesk-frontend.onrender.com", "https://techdesk.onrender.com"})
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ParentRepository parentRepository;

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
            {"1000000001", "v.kolev-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"1000000002", "k.kosev-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"1000000003", "i.ivanov-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"1000000004", "j.doe-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"1000000005", "d.kovacs-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"1000000006", "s.martinez-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"1000000007", "m.bennett-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"1000000008", "e.petrova-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"1000000009", "l.oconnor-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"1000000010", "v.ivanov-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"1000000011", "n.fischer-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"1000000012", "c.mendes-student@edu-school.bg", "password123", "STUDENT", "false"},
            {"2000000001", "h.schmidt-teacher@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000002", "a.popescu-teacher@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000003", "m.ivanova-maths@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000004", "p.georgiev-physics@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000005", "l.stoyanova-chem@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000006", "d.petrov-biology@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000007", "s.martin-english@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000008", "t.vasileva-bulgarian@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000009", "g.stefanov-geography@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000010", "r.dimitrova-philosophy@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000011", "n.koleva-englishlit@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000012", "v.georgieva-german@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000013", "i.karaslavova-spanish@edu-school.bg", "password123", "TEACHER", "false"},
            {"2000000014", "e.nikolova-anthro@edu-school.bg", "password123", "TEACHER", "false"},
            {"3000000001", "l.navarro-parent@edu-school.bg", "password123", "PARENT", "false"},
            {"4000000001", "admin@edu-school.bg", "password123", "ADMIN", "false"},
            {"9000000001", "r.paskalev-student@edu-school.bg", "pass@2026", "STUDENT", "true"},
            {"9000000002", "e.vasileva-teacher@edu-school.bg", "pass@2026", "TEACHER", "true"},
            {"9000000003", "p.stoyanov-parent@edu-school.bg", "pass@2026", "PARENT", "true"},
            {"9000000004", "s.markova-admin@edu-school.bg", "pass@2026", "ADMIN", "true"}
        };

        int created = 0;
        int skipped = 0;
        for (String[] u : users) {
            User user = new User();
            user.setEgn(u[0]);
            user.setEmail(u[1]);
            user.setPassword(passwordEncoder.encode(u[2]));
            user.setRole(Role.valueOf(u[3]));
            user.setDemo(Boolean.parseBoolean(u[4]));
            String validation = validateProfileLink(user);
            if (validation != null) {
                skipped++;
                continue;
            }
            userService.register(user);
            created++;
        }
        return ResponseEntity.ok("Users setup complete. Created: " + created + ", skipped: " + skipped);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (user == null || user.getEmail() == null || user.getPassword() == null || user.getRole() == null || user.getEgn() == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }
        String validation = validateProfileLink(user);
        if (validation != null) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(validation);
        }
        if (!user.getPassword().startsWith("$2a$") && !user.getPassword().startsWith("$2b$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return ResponseEntity.ok(userService.register(user));
    }

    private String validateProfileLink(User user) {
        if (user.isDemo()) return null;

        if (user.getRole() == Role.STUDENT) {
            Student s = studentRepository.findById(user.getEgn()).orElse(null);
            if (s == null) s = studentRepository.findByEmail(user.getEmail());
            if (s == null) return "Student profile must exist in students table";
            return null;
        }

        if (user.getRole() == Role.TEACHER) {
            Teacher t = teacherRepository.findById(user.getEgn()).orElse(null);
            if (t == null) t = teacherRepository.findByEmail(user.getEmail());
            if (t == null) return "Teacher profile must exist in teachers table";
            return null;
        }

        if (user.getRole() == Role.PARENT) {
            Parent p = parentRepository.findById(user.getEgn()).orElse(null);
            if (p == null) p = parentRepository.findByEmail(user.getEmail());
            if (p == null) return "Parent profile must exist in parents table";
            if (p.getChildEgn() == null || studentRepository.findById(p.getChildEgn()).isEmpty()) {
                return "Parent must be linked to an existing student";
            }
            return null;
        }

        return null;
    }
}
