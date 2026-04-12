package com.edutech.desk.service;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.entities.Teacher;
import java.util.List;

public interface TeacherService {
    List<Notebook> getAllStudentNotebooks();
    Notebook getStudentNotebook(String studentEgn);
    void markAttendance(String studentEgn, boolean present);
    Teacher getTeacherByEgn(String egn);
    List<Teacher> getAllTeachers();
    List<String> getTeacherSubjects(String egn);
    Teacher updateTeacherSubjects(String egn, List<String> subjects);
}
