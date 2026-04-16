package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.Grade;
import com.edutech.desk.repository.GradeRepository;
import com.edutech.desk.service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GradeServiceImpl implements GradeService {

    @Autowired
    private GradeRepository gradeRepository;

    @Override
    public Grade addGrade(Grade grade) {
        grade.setCreatedAt(LocalDateTime.now());
        return gradeRepository.save(grade);
    }

    @Override
    public Optional<Grade> getById(Long id) {
        return gradeRepository.findById(id);
    }

    @Override
    public void deleteGrade(Long id) {
        gradeRepository.deleteById(id);
    }

    @Override
    public List<Grade> getByStudent(String studentEgn) {
        return gradeRepository.findByStudentEgn(studentEgn);
    }

    @Override
    public List<Grade> getByStudentAndSubject(String studentEgn, String subject) {
        return gradeRepository.findByStudentEgnAndSubject(studentEgn, subject);
    }

    @Override
    public Map<String, Double> getStudentAverages(String studentEgn) {
        List<Grade> grades = gradeRepository.findByStudentEgn(studentEgn);
        return grades.stream()
            .collect(Collectors.groupingBy(Grade::getSubject,
                Collectors.averagingDouble(Grade::getValue)));
    }
}
