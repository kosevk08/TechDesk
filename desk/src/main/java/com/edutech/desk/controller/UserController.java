package com.edutech.desk.controller;

import com.edutech.desk.entities.User;
import com.edutech.desk.entities.Student;
import com.edutech.desk.controller.response.LoginResponse;
import com.edutech.desk.repository.StudentRepository;
import com.edutech.desk.service.JwtService;
import com.edutech.desk.service.NameLookupService;
import com.edutech.desk.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5500", "http://127.0.0.1:5500", "https://techdesk-frontend.onrender.com"})
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private NameLookupService nameLookupService;

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody User loginUser) {
        User user = userService.login(loginUser.getEmail(), loginUser.getPassword());
        if (user != null) {
            LoginResponse response = new LoginResponse();
            response.setToken(jwtService.generateToken(user.getEmail(), user.getRole().name(), user.isDemo()));
            response.setRole(user.getRole().name());
            response.setDemo(user.isDemo());
            response.setDisplayName(nameLookupService.userDisplayName(user.getEgn()));
            response.setEgn(user.getEgn());
            response.setEmail(user.getEmail());
            response.setStudentEgn(user.getStudentEgn());

            Student me = studentRepository.findById(user.getEgn()).orElse(null);
            if (me != null) {
                response.setClassName(me.getClassName());
            }
            if (user.getStudentEgn() != null) {
                response.setChildName(nameLookupService.studentName(user.getStudentEgn()));
                Student child = studentRepository.findById(user.getStudentEgn()).orElse(null);
                if (child != null) {
                    response.setChildClassName(child.getClassName());
                }
            }
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }
}
