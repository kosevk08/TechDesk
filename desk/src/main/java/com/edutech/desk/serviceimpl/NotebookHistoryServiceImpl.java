package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.NotebookHistory;
import com.edutech.desk.repository.NotebookHistoryRepository;
import com.edutech.desk.service.NotebookHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotebookHistoryServiceImpl implements NotebookHistoryService {

    @Autowired
    private NotebookHistoryRepository notebookHistoryRepository;

    @Override
    public List<NotebookHistory> getAllHistory() {
        return notebookHistoryRepository.findAll();
    }

    @Override
    public List<NotebookHistory> getHistoryByNotebookId(Long notebookId) {
        return notebookHistoryRepository.findByNotebookId(notebookId);
    }

    @Override
    public NotebookHistory saveNotebookHistory(NotebookHistory history) {
        return notebookHistoryRepository.save(history);
    }

    @Override
    public void deleteHistoryRecord(Long historyId) {
        notebookHistoryRepository.deleteById(historyId);
    }
}