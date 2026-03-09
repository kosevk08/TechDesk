package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.entities.Parent;
import com.edutech.desk.repository.NotebookRepository;
import com.edutech.desk.repository.ParentRepository;
import com.edutech.desk.service.ParentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ParentServiceImpl implements ParentService {

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private NotebookRepository notebookRepository;

    @Override
    public Notebook getChildNotebook(String childEgn) {
        List<Notebook> notebooks = notebookRepository.findByStudentEgn(childEgn);
        return notebooks.isEmpty() ? null : notebooks.get(0);
    }

    @Override
    public Parent getParentByEgn(String egn) {
        return parentRepository.findById(egn).orElse(null);
    }

    @Override
    public List<Parent> getAllParents() {
        return parentRepository.findAll();
    }
}