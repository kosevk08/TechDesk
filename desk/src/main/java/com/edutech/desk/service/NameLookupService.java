package com.edutech.desk.service;

import com.edutech.desk.entities.Student;
import com.edutech.desk.entities.Teacher;
import com.edutech.desk.entities.User;
import com.edutech.desk.repository.StudentRepository;
import com.edutech.desk.repository.TeacherRepository;
import com.edutech.desk.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class NameLookupService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    public NameLookupService(StudentRepository studentRepository,
                             TeacherRepository teacherRepository,
                             UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
    }

    public String studentName(String egn) {
        if (egn == null) return "Student";
        Student student = studentRepository.findById(egn).orElse(null);
        if (student == null) return "Student";
        return student.getFirstName() + " " + student.getLastName();
    }

    public String teacherName(String egn) {
        if (egn == null) return "Teacher";
        Teacher teacher = teacherRepository.findById(egn).orElse(null);
        if (teacher == null) return "Teacher";
        return teacher.getFirstName() + " " + teacher.getLastName();
    }

    public String userDisplayName(String egn) {
        if (egn == null) return "User";
        Student student = studentRepository.findById(egn).orElse(null);
        if (student != null) return student.getFirstName() + " " + student.getLastName();
        Teacher teacher = teacherRepository.findById(egn).orElse(null);
        if (teacher != null) return teacher.getFirstName() + " " + teacher.getLastName();
        User user = userRepository.findById(egn).orElse(null);
        if (user != null) return displayNameFromEmail(user.getEmail());
        return "User";
    }

    public String studentEgnByName(String fullName) {
        if (fullName == null) return null;
        String[] parts = normalizeName(fullName);
        if (parts == null) return null;
        Student student = studentRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase(parts[0], parts[1]);
        return student != null ? student.getEgn() : null;
    }

    public String userEgnByDisplayName(String fullName) {
        String egn = studentEgnByName(fullName);
        if (egn != null) return egn;
        String[] parts = normalizeName(fullName);
        if (parts != null) {
            Teacher teacher = teacherRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase(parts[0], parts[1]);
            if (teacher != null) return teacher.getEgn();
        }
        for (User user : userRepository.findAll()) {
            if (displayNameFromEmail(user.getEmail()).equalsIgnoreCase(fullName)) {
                return user.getEgn();
            }
        }
        return null;
    }

    public String displayNameFromEmail(String email) {
        if (email == null) return "User";
        String base = email.split("@")[0].replace('-', ' ').replace('.', ' ');
        String[] tokens = base.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String token : tokens) {
            if (token.isBlank()) continue;
            sb.append(Character.toUpperCase(token.charAt(0)))
              .append(token.substring(1).toLowerCase(Locale.ROOT))
              .append(' ');
        }
        String name = sb.toString().trim();
        return name.isEmpty() ? "User" : name;
    }

    private String[] normalizeName(String fullName) {
        String clean = fullName.trim().replaceAll("\\s+", " ");
        String[] parts = clean.split(" ");
        if (parts.length < 2) return null;
        return new String[]{parts[0], parts[1]};
    }
}
