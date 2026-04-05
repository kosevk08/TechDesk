package com.edutech.desk.controller.response;

public class AiClassOverviewResponse {
    private long totalTasks;
    private long completedTasks;
    private long skippedTasks;
    private double averageTimeSpentSeconds;
    private double averageAttempts;
    private double accuracyRate;
    private long strugglingStudentsCount;
    private long attentionAlertsCount;

    public long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }

    public long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(long completedTasks) { this.completedTasks = completedTasks; }

    public long getSkippedTasks() { return skippedTasks; }
    public void setSkippedTasks(long skippedTasks) { this.skippedTasks = skippedTasks; }

    public double getAverageTimeSpentSeconds() { return averageTimeSpentSeconds; }
    public void setAverageTimeSpentSeconds(double averageTimeSpentSeconds) { this.averageTimeSpentSeconds = averageTimeSpentSeconds; }

    public double getAverageAttempts() { return averageAttempts; }
    public void setAverageAttempts(double averageAttempts) { this.averageAttempts = averageAttempts; }

    public double getAccuracyRate() { return accuracyRate; }
    public void setAccuracyRate(double accuracyRate) { this.accuracyRate = accuracyRate; }

    public long getStrugglingStudentsCount() { return strugglingStudentsCount; }
    public void setStrugglingStudentsCount(long strugglingStudentsCount) { this.strugglingStudentsCount = strugglingStudentsCount; }

    public long getAttentionAlertsCount() { return attentionAlertsCount; }
    public void setAttentionAlertsCount(long attentionAlertsCount) { this.attentionAlertsCount = attentionAlertsCount; }
}
