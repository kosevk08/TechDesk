package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.entities.Student;
import com.edutech.desk.repository.NotebookRepository;
import com.edutech.desk.repository.StudentRepository;
import com.edutech.desk.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private NotebookRepository notebookRepository;

    @Override
    public Notebook getNotebook(String studentEgn) {
        List<Notebook> notebooks = notebookRepository.findByStudentEgn(studentEgn);
        return notebooks.isEmpty() ? null : notebooks.get(0);
    }

    @Override
    public void saveNotebook(Notebook notebook) {
        notebook.setLastUpdated(LocalDateTime.now());
        notebookRepository.save(notebook);
    }

    @Override
    public Student getStudentByEgn(String egn) {
        return studentRepository.findById(egn).orElse(null);
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
}