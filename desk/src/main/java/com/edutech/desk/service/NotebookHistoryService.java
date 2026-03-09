package com.edutech.desk.service;

import com.edutech.desk.entities.NotebookHistory;
import java.util.List;

public interface NotebookHistoryService {
    List<NotebookHistory> getAllHistory();
    List<NotebookHistory> getHistoryByNotebookId(Long notebookId);
    NotebookHistory saveNotebookHistory(NotebookHistory history);
    void deleteHistoryRecord(Long historyId);
}