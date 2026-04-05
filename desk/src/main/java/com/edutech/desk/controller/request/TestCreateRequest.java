package com.edutech.desk.controller.request;

public class TestCreateRequest {
    private String title;
    private String subject;
    private String description;
    private String questionsJson;
    private Integer totalPoints;
    private String createdByEgn;

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
    public String getCreatedByEgn() { return createdByEgn; }
    public void setCreatedByEgn(String createdByEgn) { this.createdByEgn = createdByEgn; }
}
