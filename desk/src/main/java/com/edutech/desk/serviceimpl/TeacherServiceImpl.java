package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.entities.Teacher;
import com.edutech.desk.repository.NotebookRepository;
import com.edutech.desk.repository.TeacherRepository;
import com.edutech.desk.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;

@Service
public class TeacherServiceImpl implements TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private NotebookRepository notebookRepository;

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
        return teacherRepository.findAll();
    }

    @Override
    public List<String> getTeacherSubjects(String egn) {
        Teacher teacher = teacherRepository.findById(egn).orElse(null);
        if (teacher == null || teacher.getSubjects() == null) {
            return Collections.emptyList();
        }
        return teacher.getSubjects();
    }

    @Override
    public Teacher updateTeacherSubjects(String egn, List<String> subjects) {
        Teacher teacher = teacherRepository.findById(egn).orElse(null);
        if (teacher == null) return null;
        teacher.setSubjects(subjects);
        return teacherRepository.save(teacher);
    }
}
