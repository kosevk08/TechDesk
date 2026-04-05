package com.edutech.desk.controller.response;

import com.edutech.desk.ai.AiAdaptiveRecommendation;
import com.edutech.desk.ai.AiRiskLevel;

import java.util.List;

public class AiStudentInsightResponse {
    private String studentId;
    private String studentName;
    private String className;
    private double averageTimeSpentSeconds;
    private double averageAttempts;
    private double accuracyRate;
    private long skippedTasks;
    private AiRiskLevel riskLevel;
    private AiAdaptiveRecommendation adaptiveRecommendation;
    private List<String> weaknessAreas;
    private String recommendedAction;

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public double getAverageTimeSpentSeconds() { return averageTimeSpentSeconds; }
    public void setAverageTimeSpentSeconds(double averageTimeSpentSeconds) { this.averageTimeSpentSeconds = averageTimeSpentSeconds; }

    public double getAverageAttempts() { return averageAttempts; }
    public void setAverageAttempts(double averageAttempts) { this.averageAttempts = averageAttempts; }

    public double getAccuracyRate() { return accuracyRate; }
    public void setAccuracyRate(double accuracyRate) { this.accuracyRate = accuracyRate; }

    public long getSkippedTasks() { return skippedTasks; }
    public void setSkippedTasks(long skippedTasks) { this.skippedTasks = skippedTasks; }

    public AiRiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(AiRiskLevel riskLevel) { this.riskLevel = riskLevel; }

    public AiAdaptiveRecommendation getAdaptiveRecommendation() { return adaptiveRecommendation; }
    public void setAdaptiveRecommendation(AiAdaptiveRecommendation adaptiveRecommendation) { this.adaptiveRecommendation = adaptiveRecommendation; }

    public List<String> getWeaknessAreas() { return weaknessAreas; }
    public void setWeaknessAreas(List<String> weaknessAreas) { this.weaknessAreas = weaknessAreas; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }
}
