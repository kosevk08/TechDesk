package com.edutech.desk.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_assignments")
public class TestAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "test_id", nullable = false)
    private Long testId;

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "assigned_by_egn", nullable = false)
    private String assignedByEgn;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    public TestAssignment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTestId() { return testId; }
    public void setTestId(Long testId) { this.testId = testId; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getAssignedByEgn() { return assignedByEgn; }
    public void setAssignedByEgn(String assignedByEgn) { this.assignedByEgn = assignedByEgn; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
}
