package com.edutech.desk.controller.response;

import java.time.LocalDateTime;
import java.util.List;

public class TestDetailResponse {
    private Long id;
    private String title;
    private String subject;
    private String description;
    private String questionsJson;
    private Integer totalPoints;
    private LocalDateTime createdAt;
    private List<TestAssignmentInfo> assignments;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getQuestionsJson() { return questionsJson; }
    public void setQuestionsJson(String questionsJson) { this.questionsJson = questionsJson; }
    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<TestAssignmentInfo> getAssignments() { return assignments; }
    public void setAssignments(List<TestAssignmentInfo> assignments) { this.assignments = assignments; }
}
