package com.edutech.desk.service;

import com.edutech.desk.entities.Grade;
import java.util.List;
import java.util.Map;

public interface GradeService {
    Grade addGrade(Grade grade);
    List<Grade> getByStudent(String studentEgn);
    List<Grade> getByStudentAndSubject(String studentEgn, String subject);
    Map<String, Double> getStudentAverages(String studentEgn);
}
