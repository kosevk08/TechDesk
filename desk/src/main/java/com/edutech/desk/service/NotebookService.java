package com.edutech.desk.service;

import com.edutech.desk.entities.Notebook;
import java.util.List;
import java.util.Optional;

public interface NotebookService {
    List<Notebook> getAllNotebooks();
    List<Notebook> getNotebooksByStudentEgn(String egn);
    List<Notebook> getNotebooksBySubjects(List<String> subjects);
    Notebook createNotebook(Notebook notebook);
    Notebook updateNotebook(Long id, Notebook notebook);
    Optional<Notebook> getByStudentEgnAndSubjectAndPage(String egn, String subject, int page);
}
