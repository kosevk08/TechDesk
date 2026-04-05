package com.edutech.desk.controller.response;

import java.time.LocalDate;

public class ClassTestSummaryResponse {
    private Long testId;
    private String title;
    private String className;
    private LocalDate dueDate;
    private int submissionsCount;
    private int gradedCount;

    public Long getTestId() { return testId; }
    public void setTestId(Long testId) { this.testId = testId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public int getSubmissionsCount() { return submissionsCount; }
    public void setSubmissionsCount(int submissionsCount) { this.submissionsCount = submissionsCount; }
    public int getGradedCount() { return gradedCount; }
    public void setGradedCount(int gradedCount) { this.gradedCount = gradedCount; }
}
