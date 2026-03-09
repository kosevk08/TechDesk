package com.edutech.desk.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notebook_history")
public class NotebookHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    private Long notebookId;
    private String studentEgn;
    private String subject;
    private String schoolYear;
    private String format;
    private String style;
    private String color;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime changedAt;

    public NotebookHistory() {}

    public Long getHistoryId() { return historyId; }
    public void setHistoryId(Long historyId) { this.historyId = historyId; }
    public Long getNotebookId() { return notebookId; }
    public void setNotebookId(Long notebookId) { this.notebookId = notebookId; }
    public String getStudentEgn() { return studentEgn; }
    public void setStudentEgn(String studentEgn) { this.studentEgn = studentEgn; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getSchoolYear() { return schoolYear; }
    public void setSchoolYear(String schoolYear) { this.schoolYear = schoolYear; }
    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }
    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}