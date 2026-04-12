package com.edutech.desk.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_task_data")
public class AiTaskData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "task_id", nullable = false)
    private String taskId;

    @Column(name = "subject_name")
    private String subject;

    @Column(name = "concept_name")
    private String concept;

    @Column(name = "class_name")
    private String className;

    @Column(name = "notebook_subject")
    private String notebookSubject;

    @Column(name = "notebook_page")
    private Integer notebookPage;

    @Column(name = "time_spent_seconds", nullable = false)
    private Long timeSpent;

    @Column(nullable = false)
    private Integer attempts;

    @Column(nullable = false)
    private Boolean correct;

    @Column(nullable = true)
    private Integer corrections;

    @Column(nullable = true)
    private Boolean completed;

    @Column(nullable = true)
    private Boolean skipped;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public AiTaskData() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getConcept() { return concept; }
    public void setConcept(String concept) { this.concept = concept; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getNotebookSubject() { return notebookSubject; }
    public void setNotebookSubject(String notebookSubject) { this.notebookSubject = notebookSubject; }

    public Integer getNotebookPage() { return notebookPage; }
    public void setNotebookPage(Integer notebookPage) { this.notebookPage = notebookPage; }

    public Long getTimeSpent() { return timeSpent; }
    public void setTimeSpent(Long timeSpent) { this.timeSpent = timeSpent; }

    public Integer getAttempts() { return attempts; }
    public void setAttempts(Integer attempts) { this.attempts = attempts; }

    public Boolean getCorrect() { return correct; }
    public void setCorrect(Boolean correct) { this.correct = correct; }

    public Integer getCorrections() { return corrections; }
    public void setCorrections(Integer corrections) { this.corrections = corrections; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public Boolean getSkipped() { return skipped; }
    public void setSkipped(Boolean skipped) { this.skipped = skipped; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
