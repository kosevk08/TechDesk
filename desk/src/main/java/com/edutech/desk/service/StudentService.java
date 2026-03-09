package com.edutech.desk.service;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.entities.Student;
import java.util.List;

public interface StudentService {
    Notebook getNotebook(String studentEgn);
    void saveNotebook(Notebook notebook);
    Student getStudentByEgn(String egn);
    List<Student> getAllStudents();
}