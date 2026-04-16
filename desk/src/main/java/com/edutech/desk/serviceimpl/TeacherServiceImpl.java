package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.entities.Teacher;
import com.edutech.desk.entities.User;
import com.edutech.desk.entities.Role;
import com.edutech.desk.repository.NotebookRepository;
import com.edutech.desk.repository.TeacherRepository;
import com.edutech.desk.repository.UserRepository;
import com.edutech.desk.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;
import java.util.Locale;

@Service
public class TeacherServiceImpl implements TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private NotebookRepository notebookRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<Notebook> getAllStudentNotebooks() {
        return notebookRepository.findAll();
    }

    @Override
    public Notebook getStudentNotebook(String studentEgn) {
        List<Notebook> notebooks = notebookRepository.findByStudentEgn(studentEgn);
        return notebooks.isEmpty() ? null : notebooks.get(0);
    }

    @Override
    public void markAttendance(String studentEgn, boolean present) {
    }

    @Override
    public Teacher getTeacherByEgn(String egn) {
        return teacherRepository.findById(egn).orElse(null);
    }

    @Override
    public List<Teacher> getAllTeachers() {
        List<Teacher> teachers = new ArrayList<>(teacherRepository.findAll());
        if (!teachers.isEmpty()) {
            for (Teacher teacher : teachers) {
                List<String> subjects = teacherRepository.findSubjectsByTeacherEgn(teacher.getEgn());
                teacher.setSubjects(subjects == null ? Collections.emptyList() : subjects);
            }
            return teachers;
        }
        List<User> teacherUsers = userRepository.findAll().stream()
            .filter(u -> u.getRole() == Role.TEACHER)
            .toList();
        for (User u : teacherUsers) {
            Teacher virtualTeacher = new Teacher();
            virtualTeacher.setEgn(u.getEgn());
            virtualTeacher.setEmail(u.getEmail());
            String display = buildDisplayName(u);
            String[] parts = display.trim().split("\\s+");
            virtualTeacher.setFirstName(parts.length > 0 ? parts[0] : "Teacher");
            virtualTeacher.setLastName(parts.length > 1 ? String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length)) : "User");
            List<String> subjects = teacherRepository.findSubjectsByTeacherEgn(u.getEgn());
            virtualTeacher.setSubjects(subjects == null ? Collections.emptyList() : subjects);
            teachers.add(virtualTeacher);
        }
        return teachers;
    }

    @Override
    public List<String> getTeacherSubjects(String egn) {
        List<String> subjects = teacherRepository.findSubjectsByTeacherEgn(egn);
        return subjects == null ? Collections.emptyList() : subjects;
    }

    @Override
    public Teacher updateTeacherSubjects(String egn, List<String> subjects) {
        Teacher teacher = teacherRepository.findById(egn).orElse(null);
        if (teacher == null) {
            User user = userRepository.findById(egn).orElse(null);
            if (user == null || user.getRole() != Role.TEACHER) return null;
            teacher = new Teacher();
            teacher.setEgn(user.getEgn());
            teacher.setEmail(user.getEmail());
            String display = buildDisplayName(user);
            String[] parts = display.trim().split("\\s+");
            teacher.setFirstName(parts.length > 0 ? parts[0] : "Teacher");
            teacher.setLastName(parts.length > 1 ? String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length)) : "User");
        }
        teacher.setSubjects(subjects);
        Teacher saved = teacherRepository.save(teacher);
        List<String> persistedSubjects = teacherRepository.findSubjectsByTeacherEgn(saved.getEgn());
        saved.setSubjects(persistedSubjects == null ? Collections.emptyList() : persistedSubjects);
        return saved;
    }

    private String buildDisplayName(User user) {
        if (user == null) return "Teacher User";
        String display = user.getDisplayName();
        if (display != null && !display.isBlank() && !"User".equalsIgnoreCase(display.trim()) && !"User User".equalsIgnoreCase(display.trim())) {
            return display.trim();
        }
        String email = user.getEmail();
        if (email != null && !email.isBlank()) {
            String local = email.split("@")[0]
                .replaceAll("[-_.]+", " ")
                .replaceAll("\\b(student|teacher|parent|admin)\\b", " ")
                .replaceAll("\\s+", " ")
                .trim();
            if (!local.isBlank()) {
                String[] parts = local.split(" ");
                StringBuilder name = new StringBuilder();
                for (String part : parts) {
                    if (part.isBlank()) continue;
                    if (name.length() > 0) name.append(" ");
                    name.append(part.substring(0, 1).toUpperCase(Locale.ROOT))
                        .append(part.length() > 1 ? part.substring(1) : "");
                }
                if (!name.toString().isBlank()) return name.toString();
            }
        }
        return "Teacher User";
    }
}
