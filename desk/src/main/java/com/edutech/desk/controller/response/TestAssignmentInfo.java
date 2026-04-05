package com.edutech.desk.controller.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TestAssignmentInfo {
    private Long id;
    private String className;
    private LocalDate dueDate;
    private LocalDateTime assignedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
}
