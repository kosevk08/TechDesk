package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.Notebook;
import com.edutech.desk.repository.NotebookRepository;
import com.edutech.desk.service.NotebookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class NotebookServiceImpl implements NotebookService {

    @Autowired
    private NotebookRepository notebookRepository;

    @Override
    public List<Notebook> getAllNotebooks() {
        return notebookRepository.findAll();
    }

    @Override
    public List<Notebook> getNotebooksByStudentEgn(String egn) {
        return notebookRepository.findByStudentEgn(egn);
    }

    @Override
    public Notebook createNotebook(Notebook notebook) {
        return notebookRepository.save(notebook);
    }

    @Override
    public Notebook updateNotebook(Long id, Notebook notebook) {
        notebook.setId(id);
        return notebookRepository.save(notebook);
    }

    @Override
    public Optional<Notebook> getByStudentEgnAndSubjectAndPage(String egn, String subject, int page) {
        return notebookRepository.findByStudentEgnAndSubjectAndPageNumber(egn, subject, page);
    }
}