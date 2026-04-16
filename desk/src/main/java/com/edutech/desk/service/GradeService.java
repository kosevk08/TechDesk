package com.edutech.desk.service;

import com.edutech.desk.entities.Grade;
import java.util.Optional;
import java.util.List;
import java.util.Map;

public interface GradeService {
    Grade addGrade(Grade grade);
    Optional<Grade> getById(Long id);
    void deleteGrade(Long id);
    List<Grade> getByStudent(String studentEgn);
    List<Grade> getByStudentEgns(List<String> studentEgns);
    List<Grade> getByStudentAndSubject(String studentEgn, String subject);
    Map<String, Double> getStudentAverages(String studentEgn);
}
