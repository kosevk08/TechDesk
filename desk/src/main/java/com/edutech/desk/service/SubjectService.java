package com.edutech.desk.service;

import com.edutech.desk.entities.Subject;
import java.util.List;

public interface SubjectService {
    List<Subject> getAllSubjects();
    Subject getSubjectById(Long id);
    Subject createSubject(Subject subject);
    Subject updateSubject(Long id, Subject subject);
    void deleteSubject(Long id);
}