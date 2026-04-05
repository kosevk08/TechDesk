package com.edutech.desk.controller.response;

import com.edutech.desk.ai.AiDifficultyLevel;

public class AiTopicInsightResponse {
    private String label;
    private String subject;
    private long totalInteractions;
    private double averageTimeSpentSeconds;
    private double averageAttempts;
    private double accuracyRate;
    private AiDifficultyLevel difficultyLevel;
    private String teacherAction;

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public long getTotalInteractions() { return totalInteractions; }
    public void setTotalInteractions(long totalInteractions) { this.totalInteractions = totalInteractions; }

    public double getAverageTimeSpentSeconds() { return averageTimeSpentSeconds; }
    public void setAverageTimeSpentSeconds(double averageTimeSpentSeconds) { this.averageTimeSpentSeconds = averageTimeSpentSeconds; }

    public double getAverageAttempts() { return averageAttempts; }
    public void setAverageAttempts(double averageAttempts) { this.averageAttempts = averageAttempts; }

    public double getAccuracyRate() { return accuracyRate; }
    public void setAccuracyRate(double accuracyRate) { this.accuracyRate = accuracyRate; }

    public AiDifficultyLevel getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(AiDifficultyLevel difficultyLevel) { this.difficultyLevel = difficultyLevel; }

    public String getTeacherAction() { return teacherAction; }
    public void setTeacherAction(String teacherAction) { this.teacherAction = teacherAction; }
}
