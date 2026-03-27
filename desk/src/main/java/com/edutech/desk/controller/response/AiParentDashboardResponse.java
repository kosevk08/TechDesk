package com.edutech.desk.controller.response;

import com.edutech.desk.ai.AiEngagementLevel;
import com.edutech.desk.ai.AiProgressTrend;

import java.util.List;

public class AiParentDashboardResponse {
    private String studentId;
    private String studentName;
    private String className;
    private double accuracyRate;
    private double averageTimeSpentSeconds;
    private double averageAttempts;
    private AiProgressTrend progressTrend;
    private AiEngagementLevel engagementLevel;
    private long skippedTasks;
    private List<String> weakSubjects;
    private List<String> strengths;
    private List<String> parentActions;
    private AiAttendanceSnapshotResponse attendance;

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public double getAccuracyRate() { return accuracyRate; }
    public void setAccuracyRate(double accuracyRate) { this.accuracyRate = accuracyRate; }

    public double getAverageTimeSpentSeconds() { return averageTimeSpentSeconds; }
    public void setAverageTimeSpentSeconds(double averageTimeSpentSeconds) { this.averageTimeSpentSeconds = averageTimeSpentSeconds; }

    public double getAverageAttempts() { return averageAttempts; }
    public void setAverageAttempts(double averageAttempts) { this.averageAttempts = averageAttempts; }

    public AiProgressTrend getProgressTrend() { return progressTrend; }
    public void setProgressTrend(AiProgressTrend progressTrend) { this.progressTrend = progressTrend; }

    public AiEngagementLevel getEngagementLevel() { return engagementLevel; }
    public void setEngagementLevel(AiEngagementLevel engagementLevel) { this.engagementLevel = engagementLevel; }

    public long getSkippedTasks() { return skippedTasks; }
    public void setSkippedTasks(long skippedTasks) { this.skippedTasks = skippedTasks; }

    public List<String> getWeakSubjects() { return weakSubjects; }
    public void setWeakSubjects(List<String> weakSubjects) { this.weakSubjects = weakSubjects; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getParentActions() { return parentActions; }
    public void setParentActions(List<String> parentActions) { this.parentActions = parentActions; }

    public AiAttendanceSnapshotResponse getAttendance() { return attendance; }
    public void setAttendance(AiAttendanceSnapshotResponse attendance) { this.attendance = attendance; }
}
