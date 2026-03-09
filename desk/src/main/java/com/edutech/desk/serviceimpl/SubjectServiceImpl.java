package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.Subject;
import com.edutech.desk.repository.SubjectRepository;
import com.edutech.desk.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubjectServiceImpl implements SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    @Override
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Override
    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id).orElse(null);
    }

    @Override
    public Subject createSubject(Subject subject) {
        return subjectRepository.save(subject);
    }

    @Override
    public Subject updateSubject(Long id, Subject subject) {
        subject.setId(id);
        return subjectRepository.save(subject);
    }

    @Override
    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }
}